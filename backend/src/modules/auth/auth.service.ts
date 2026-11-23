
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/database";
import type { RegisterInput, LoginInput } from "./auth.validation";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

const SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AuthError("Email already registered", 409, "CONFLICT");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "USER",
      },
    });

    return safeUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AuthError("Email already registered", 409, "CONFLICT");
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", 401, "UNAUTHENTICATED");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password", 401, "UNAUTHENTICATED");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    JWT_SECRET!,
    {
      expiresIn: "24h",
    }
  );

  return {
    token,
    user: safeUser(user),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AuthError("User not found", 404, "NOT_FOUND");
  }

  return safeUser(user);
}
