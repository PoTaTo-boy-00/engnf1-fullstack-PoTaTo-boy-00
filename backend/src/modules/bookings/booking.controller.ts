
import type { Request, Response, NextFunction } from "express";
import { adminBookingsQuerySchema, createBookingSchema, myBookingsQuerySchema, rejectBookingSchema } from "./booking.validation";
import { approveBooking, cancelBooking, createBooking, getAdminBookingStats, getAllBookings, getMyBookings, rejectBooking } from "./booking.service";

export async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createBookingSchema.parse(req.body);
    const booking = await createBooking(req.user!.id, input);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}


export async function getMyBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = myBookingsQuerySchema.parse(req.query);
    const result = await getMyBookings(req.user!.id, query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}



export async function getAllBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = adminBookingsQuerySchema.parse(req.query);
    const result = await getAllBookings(query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


export async function cancelBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const booking = await cancelBooking(
      req.params.id as string,
      req.user!.id
    );

    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
}

export async function approveBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const booking = await approveBooking(req.params.id as string);
    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
}

export async function rejectBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { note } = rejectBookingSchema.parse(req.body);
    const booking = await rejectBooking(
      req.params.id as string,
      note
    );

    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBookingStatsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getAdminBookingStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}
