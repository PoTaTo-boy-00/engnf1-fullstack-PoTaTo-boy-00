import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import { BookingError } from "../../utils/api-error";
import {
  AdminBookingsQuery,
  CreateBookingInput,
  MyBookingsQuery,
} from "./booking.validation";

export async function createBooking(userId: string, input: CreateBookingInput) {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);
  if (
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime()) ||
    startTime >= endTime
  ) {
    throw new BookingError(
      "Invalid booking time range",
      400,
      "VALIDATION_ERROR",
    );
  }
  return prisma.$transaction(
    async (tx) => {
      const [resource] = await tx.$queryRaw<
        {
          id: string;
          isActive: boolean;
        }[]
      >`SELECT id, "isActive"
        from "resources"
        where id=${input.resourceId}
        for update
        `;
      await tx.$queryRaw`
        SELECT id
        FROM "users"
        WHERE id = ${userId}
        FOR UPDATE
        `;
      if (!resource) {
        throw new BookingError("Resource not found", 404, "NOT_FOUND");
      }

      if (!resource.isActive) {
        throw new BookingError("Resource is inactive", 409, "CONFLICT");
      }
      if (input.ticketId) {
        const ticket = await tx.ticket.findUnique({
          where: { id: input.ticketId },
          select: { id: true },
        });

        if (!ticket) {
          throw new BookingError("Ticket not found", 404, "NOT_FOUND");
        }
      }

      const now = new Date();
      const userBookingCount = await tx.booking.count({
        where: {
          userId,
          status: { in: ["PENDING", "APPROVED"] },
          startTime: { gt: now },
        },
      });

      if (userBookingCount >= 3) {
        throw new BookingError(
          "Maximum of 3 future active bookings allowed",
          409,
          "CONFLICT",
        );
      }
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          resourceId: input.resourceId,
          status: { in: ["PENDING", "APPROVED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true },
      });
      if (overlappingBooking) {
        throw new BookingError(
          "Resource is already booked for this time slot",
          409,
          "CONFLICT",
        );
      }
      return tx.booking.create({
        data: {
          resourceId: input.resourceId,
          userId,
          ticketId: input.ticketId,
          startTime,
          endTime,
          purpose: input.purpose,
          status: "PENDING",
        },
      });
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );
}

export async function getMyBookings(userId: string, query: MyBookingsQuery) {
  const limit = 10;
  const skip = (query.page - 1) * limit;

  const where = {
    userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [bookings, total] = await prisma.$transaction(
    [
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          resource: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ],
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return {
    bookings,
    pagination: {
      page: query.page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllBookings(query: AdminBookingsQuery) {
  const limit = 10;
  const skip = (query.page - 1) * limit;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.resourceId ? { resourceId: query.resourceId } : {}),
    ...(query.from || query.to
      ? {
          startTime: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const [bookings, total] = await prisma.$transaction(
    [
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          resource: {
            select: { id: true, name: true, type: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ],
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return {
    bookings,
    pagination: {
      page: query.page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getBookingForTransition(
  tx: Prisma.TransactionClient,
  bookingId: string,
) {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new BookingError("Booking not found", 404, "NOT_FOUND");
  }
  if (booking.startTime <= new Date()) {
    throw new BookingError(
      "Booking can no longer be modified",
      409,
      "CONFLICT",
    );
  }
  return booking;
}

export async function cancelBooking(bookingId:string,userId:string){
    return prisma.$transaction(async(tx)=>{
            const booking = await getBookingForTransition(tx, bookingId);

    if (booking.userId !== userId) {
      throw new BookingError(
        "You cannot cancel this booking",
        403,
        "FORBIDDEN"
      );
    }

    if (!["PENDING", "APPROVED"].includes(booking.status)) {
      throw new BookingError(
        "This booking cannot be cancelled",
        409,
        "CONFLICT"
      );
    }
    const result = await tx.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: { in: ["PENDING", "APPROVED"] },
        startTime: { gt: new Date() },
      },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      throw new BookingError(
        "Booking can no longer be cancelled",
        409,
        "CONFLICT"
      );
    }

    return tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });
    },{
     maxWait: 10000,
      timeout: 30000,
  })
}