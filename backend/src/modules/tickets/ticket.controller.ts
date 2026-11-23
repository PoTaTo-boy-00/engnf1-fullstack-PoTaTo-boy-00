
import type { Request, Response, NextFunction } from "express";
import { importTicketsSchema, getTicketsSchema, updateTicketSchema } from "./ticket.validation";
import { getTicketById, getTickets, getTicketStats, importTickets, updateTicket } from "./ticket.service";
import { prisma } from "../../config/database";

export async function importTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = importTicketsSchema.parse(req.body);
    const result = await importTickets(input);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


export async function getTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = getTicketsSchema.parse(req.query);
    const result = await getTickets(query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTicketByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ticket = await getTicketById(req.params.id as string);

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Ticket not found",
        },
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function updateTicketController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existing = await prisma.ticket.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Ticket not found",
        },
      });
    }

    const input = updateTicketSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "User not found",
        },
      });
    }

    const actor = req.header("X-Agent")?.trim() || user.email;

    const ticket = await updateTicket(
      req.params.id as string,
      input,
      actor
    );

    const events = await prisma.ticketEvent.findMany({
      where: { ticketId: ticket!.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ ticket, events });
  } catch (error) {
    next(error);
  }
}


export async function getTicketStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getTicketStats();
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}