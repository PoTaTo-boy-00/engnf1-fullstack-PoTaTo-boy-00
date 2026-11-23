
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

interface TokenPayload {
  sub: string;
  role: "USER" | "ADMIN";
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication token required",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;

    if (
      typeof decoded.sub !== "string" ||
      !["USER", "ADMIN"].includes(decoded.role)
    ) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Invalid or expired token",
      },
    });
  }
}
