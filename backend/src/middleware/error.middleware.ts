
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthError } from "../modules/auth/auth.service";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(error);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: error.issues[0]?.message ?? "Invalid request data",
      },
    });
  }

  // Known authentication errors
  if (error instanceof AuthError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Prisma unique constraint violation
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "A record with this value already exists",
      },
    });
  }

  // Unexpected errors
  console.error("Unhandled error:", error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
