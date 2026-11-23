import { prisma } from "../../config/database";
import type { CreateResourceInput, ResourceQuery, UpdateResourceInput } from "./resource.validation";
import type { Role } from "../../generated/prisma/client";

export async function getResources(
  query: ResourceQuery,
  role: Role
) {
  const { search, type, minCapacity, page } = query;
  const limit = 10;

  const where = {
    ...(role === "USER" && { isActive: true }),
    ...(type && { type }),
    ...(minCapacity !== undefined && {
      capacity: { gte: minCapacity },
    }),
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [resources, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.resource.count({ where }),
  ],
{
    maxWait: 10000,
    timeout: 30000,
  }
);

  return {
    data: resources,
    page,
    pageSize: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
export async function getResourceById(id: string, role: Role) {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource || (role === "USER" && !resource.isActive)) {
    return null;
  }

  return resource;
}
export async function createResource(input: CreateResourceInput) {
  return prisma.resource.create({
    data: input,
  });
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput
) {
  const existing = await prisma.resource.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  return prisma.resource.update({
    where: { id },
    data: input,
  });
}

export async function getResourceAvailability(
  id: string,
  role: Role,
  from: Date,
  to: Date
) {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource || (role === "USER" && !resource.isActive)) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      resourceId: id,
      status: {
        in: ["PENDING", "APPROVED"],
      },
      startTime: { lt: to },
      endTime: { gt: from },
    },
    select: {
      startTime: true,
      endTime: true,
      status: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return {
    resourceId: id,
    from: from.toISOString(),
    to: to.toISOString(),
    bookings,
  };
}