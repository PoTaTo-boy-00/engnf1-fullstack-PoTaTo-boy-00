import { z } from "zod";

export const createBookingSchema = z
  .object({
    resourceId: z.string().uuid(),

    startTime: z.string().datetime(),

    endTime: z.string().datetime(),

    purpose: z.string().trim().min(5).max(200),

    ticketId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const now = Date.now();

    const duration = (end.getTime() - start.getTime()) / 60000;

    // Start and end must align with the 30-minute UTC grid.
    for (const [field, date] of [
      ["startTime", start],
      ["endTime", end],
    ] as const) {
      if (
        date.getUTCMinutes() % 30 !== 0 ||
        date.getUTCSeconds() !== 0 ||
        date.getUTCMilliseconds() !== 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${field} must align with a 30-minute UTC interval`,
        });
      }
    }

    if (duration < 30 || duration > 240) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Booking duration must be between 30 and 240 minutes",
      });
    }

    if (start.getTime() <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Booking must start in the future",
      });
    }

    if (start.getTime() > now + 30 * 24 * 60 * 60 * 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Booking cannot start more than 30 days ahead",
      });
    }
  });


export const myBookingsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});



export const adminBookingsQuerySchema = z
  .object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
    resourceId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
  .refine(
    (data) => !data.from || !data.to || new Date(data.from) < new Date(data.to),
    {
      message: "from must be earlier than to",
      path: ["to"],
    }
  );



export const rejectBookingSchema = z.object({
  note: z.string().trim().min(5).max(200),
});

export const bookingIdSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
});

export type BookingIdParams = z.infer<typeof bookingIdSchema>;

export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>;


export type CreateBookingInput = z.infer<typeof createBookingSchema>;


export type MyBookingsQuery = z.infer<typeof myBookingsQuerySchema>;