"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { authService } from "@/services/auth.service";
import { getApiError } from "@/lib/get-api-error";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;


export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,

    onSuccess: () => {
      router.replace("/login?registered=1");
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register to access TriageSync.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Full name</label>

            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...register("name")}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message || "Name must contain 2–50 characters"}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email address
            </label>

            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              {...register("password")}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {registerMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiError(registerMutation.error)}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg bg-black px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-black underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
