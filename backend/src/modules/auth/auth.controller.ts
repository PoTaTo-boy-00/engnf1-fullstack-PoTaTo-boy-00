
import type { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  loginSchema,
} from "./auth.validation";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "./auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
    }

    const user = await getCurrentUser(userId);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
