import { totalmem } from "node:os";
import { prisma } from "../../config/database";
import { classifyTicket } from "./ticket.classifier";
import {
  ImportTicketsInput,
  TicketsQuery,
  UpdateTicketInput,
} from "./ticket.validation";
import { Prisma } from "../../generated/prisma/client";

const categories = [
  "BILLING",
  "BUG",
  "FEATURE_REQUEST",
  "LOGIN",
  "DELIVERY",
] as const;

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export async function importTickets(input: ImportTicketsInput) {
  const result = {
    importedCount: 0,
    updatedCount: 0,
    skippedOverrideCount: 0,
    total: input.tickets.length,
  };

  await prisma.$transaction(
    async (tx) => {
      for (const incoming of input.tickets) {
        const existing = await tx.ticket.findUnique({
          where: { externalId: incoming.externalId },
        });

        const classification = classifyTicket(incoming.subject, incoming.body);

        if (!existing) {
          await tx.ticket.create({
            data: {
              externalId: incoming.externalId,
              subject: incoming.subject,
              body: incoming.body,
              autoCategory: classification.category,
              category: classification.category,
              priority: classification.priority,
              status: "OPEN",
              isHumanOverride: false,
              isReviewed: false,
            },
          });

          result.importedCount++;
          continue;
        }

        const contentChanged =
          existing.subject !== incoming.subject ||
          existing.body !== incoming.body;

        const updateData: {
          subject?: string;
          body?: string;
          autoCategory?: typeof classification.category;
          category?: typeof classification.category;
          priority?: typeof classification.priority;
        } = {};

        if (existing.subject !== incoming.subject) {
          updateData.subject = incoming.subject;
        }

        if (existing.body !== incoming.body) {
          updateData.body = incoming.body;
        }

        if (existing.isHumanOverride) {
          result.skippedOverrideCount++;
        } else {
          if (existing.autoCategory !== classification.category) {
            updateData.autoCategory = classification.category;
          }

          if (existing.category !== classification.category) {
            updateData.category = classification.category;
          }

          if (existing.priority !== classification.priority) {
            updateData.priority = classification.priority;
          }
        }

        const classificationChanged =
          !existing.isHumanOverride &&
          (existing.autoCategory !== classification.category ||
            existing.category !== classification.category ||
            existing.priority !== classification.priority);

        if (contentChanged || classificationChanged) {
          await tx.ticket.update({
            where: { id: existing.id },
            data: updateData,
          });

          result.updatedCount++;
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return result;
}

export async function getTickets(query: TicketsQuery) {
  const { status, category, priority, q, page, limit } = query;

  const where = {
    ...(status && { status }),
    ...(category && { category }),
    ...(priority && { priority }),
    ...(q && {
      OR: [
        {
          subject: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
        {
          body: {
            contains: q,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [tickets, total] = await prisma.$transaction(
    [
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.ticket.count({ where }),
    ],
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return {
    data: tickets,
    page,
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  return ticket;
}
export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
  actor: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.ticket.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const changes: {
      field: "category" | "priority" | "status" | "assigneeId";
      oldValue: string | null;
      newValue: string | null;
    }[] = [];

    for (const field of [
      "category",
      "priority",
      "status",
      "assigneeId",
    ] as const) {
      if (input[field] !== undefined && input[field] !== existing[field]) {
        changes.push({
          field,
          oldValue: existing[field] === null ? null : String(existing[field]),
          newValue: input[field] === null ? null : String(input[field]),
        });
      }
    }

    if (changes.length === 0) {
      return existing;
    }

    const categoryChanged = changes.some(
      (change) => change.field === "category",
    );

    const statusChangedFromOpen =
      existing.status === "OPEN" &&
      changes.some((change) => change.field === "status");

    const updated = await tx.ticket.update({
      where: { id },
      data: {
        ...input,
        ...(categoryChanged && { isHumanOverride: true }),
        ...((categoryChanged || statusChangedFromOpen) && {
          isReviewed: true,
        }),
      },
    });

    await tx.ticketEvent.createMany({
      data: changes.map((change) => ({
        ticketId: id,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        actor,
      })),
    });

    return updated;
  });
}

export async function getTicketStats() {
  const [
    categoryGroups,
    priorityGroups,
    statusGroups,
    reviewedCount,
    agreementCount,
  ] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: ["priority"],
      _count: { _all: true },
    }),

    prisma.ticket.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    prisma.ticket.count({
      where: { isReviewed: true },
    }),
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "tickets"
        WHERE "isReviewed"=true
            AND "category"="autoCategory"
        `),
  ]);
  const byCategory = Object.fromEntries(
    categories.map((category) => [
      category,
      categoryGroups.find((item) => item.category === category)?._count._all ??
        0,
    ]),
  );

  const byPriority = Object.fromEntries(
    priorities.map((priority) => [
      priority,
      priorityGroups.find((item) => item.priority === priority)?._count._all ??
        0,
    ]),
  );

  const byStatus = Object.fromEntries(
    statuses.map((status) => [
      status,
      statusGroups.find((item) => item.status === status)?._count._all ?? 0,
    ]),
  );

  const matchingCount = Number(agreementCount[0]?.count ?? 0);
  const modelAgreementRate =
    reviewedCount === 0
      ? 0
      : Number(((matchingCount / reviewedCount) * 100).toFixed(2));

  return {
    byCategory,
    byPriority,
    byStatus,
    reviewedCount,
    modelAgreementRate,
  };
}
