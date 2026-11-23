import { z } from "zod";

export const createResourceSchema = z.object({
  name: z.string().trim().min(3).max(60),
  type: z.enum(["ROOM", "LAB", "EQUIPMENT"]),
  capacity: z.coerce.number().int().min(1).max(500),
  description: z.string().trim().max(300).optional().nullable(),
});

export const updateResourceSchema = z
  .object({
    name: z.string().trim().min(3).max(60).optional(),
    type: z.enum(["ROOM", "LAB", "EQUIPMENT"]).optional(),
    capacity: z.coerce.number().int().min(1).max(500).optional(),
    description: z.string().trim().max(300).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const resourceQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(["ROOM", "LAB", "EQUIPMENT"]).optional(),
  minCapacity: z.coerce.number().int().min(1).max(500).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export const availabilityQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
}).refine(
  (data) => new Date(data.from) < new Date(data.to),
  {
    message: "'from' must be earlier than 'to'",
  }
).refine(
  (data) =>
    new Date(data.to).getTime() - new Date(data.from).getTime()
    <= 7 * 24 * 60 * 60 * 1000,
  {
    message: "Availability range cannot exceed 7 days",
  }
);

export type AvailabilityQuery = z.infer<
  typeof availabilityQuerySchema
>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQuery = z.infer<typeof resourceQuerySchema>;