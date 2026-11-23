
import { z } from "zod";

// ==========================================
// ENUMS
// ==========================================

export const ticketCategorySchema = z.enum([
  "BILLING",
  "BUG",
  "FEATURE_REQUEST",
  "LOGIN",
  "DELIVERY",
]);

export const ticketPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const ticketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

// ==========================================
// TICKET IMPORT
// POST /api/tickets/import
// ==========================================

const importTicketSchema = z.object({
  externalId: z.string().trim().min(1),
  subject: z.string().trim().min(3).max(150),
  body: z.string().trim().min(5).max(2000),
});

export const importTicketsSchema = z.object({
  tickets: z.array(importTicketSchema).min(1),
});

// ==========================================
// GET TICKETS QUERY
// GET /api/tickets
// ==========================================

export const getTicketsSchema = z.object({
  status: ticketStatusSchema.optional(),
  category: ticketCategorySchema.optional(),
  priority: ticketPrioritySchema.optional(),

  q: z.string().trim().optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});


// ==========================================
// UPDATE TICKET
// PATCH /api/tickets/:id
// ==========================================

export const updateTicketSchema = z
  .object({
    category: ticketCategorySchema.optional(),

    priority: ticketPrioritySchema.optional(),

    status: ticketStatusSchema.optional(),

    assigneeId: z
      .string()
      .uuid("Invalid assignee ID")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    }
  );

// ==========================================
// TYPES
// ==========================================

export type ImportTicketsInput = z.infer<
  typeof importTicketsSchema
>;

export type TicketsQuery = z.infer<
  typeof getTicketsSchema
>;

export type UpdateTicketInput = z.infer<
  typeof updateTicketSchema
>;
