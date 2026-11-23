"use client";

import { useState } from "react";
import Link from "next/link";
import { useMyBookings } from "@/hooks/use-my-bookings";
import { useCancelBooking } from "@/hooks/use-cancel-booking";
import type { BookingStatus } from "@/types/booking";

type StatusFilter = BookingStatus | "ALL";

const statuses: StatusFilter[] = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canCancel(status: BookingStatus, startTime: string) {
  return (
    (status === "PENDING" || status === "APPROVED") &&
    new Date(startTime).getTime() > Date.now()
  );
}

function getErrorMessage(error: unknown) {
  const err = error as {
    response?: {
      data?: {
        error?: { message?: string };
        message?: string;
      };
    };
  };

  return (
    err.response?.data?.error?.message ??
    err.response?.data?.message ??
    "Unable to cancel booking. Please try again."
  );
}

export default function MyBookingsPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [cancelError, setCancelError] = useState("");

  const filters = {
    ...(status !== "ALL" && { status }),
    page,
  };

  const bookingsQuery = useMyBookings(filters);
  const cancelBooking = useCancelBooking();

  const bookings = bookingsQuery.data?.bookings ?? [];
  const pagination = bookingsQuery.data?.pagination;

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
    setCancelError("");
  }

  function handleCancel(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancelError("");

    cancelBooking.mutate(id, {
      onError: (error) => {
        setCancelError(getErrorMessage(error));
      },
    });
  }

  if (bookingsQuery.isPending) {
    return (
      <main className="p-6">
        <p className="text-gray-500">Loading your bookings...</p>
      </main>
    );
  }

  if (bookingsQuery.isError || !bookingsQuery.data) {
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-red-600">Unable to load your bookings.</p>
        <button
          onClick={() => bookingsQuery.refetch()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your resource booking requests.
          </p>
        </div>

        <Link
          href="/resources"
          className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse Resources
        </Link>
      </div>

      {/* Status filters */}
      <section className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item}
            onClick={() => handleStatusChange(item)}
            className={`rounded-md border px-3 py-2 text-sm ${
              status === item
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item === "ALL" ? "All bookings" : item.replace("_", " ")}
          </button>
        ))}
      </section>

      {cancelError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {cancelError}
        </p>
      )}

      {cancelBooking.isPending && (
        <p className="text-sm text-gray-500">
          Processing cancellation...
        </p>
      )}

      {/* Booking list */}
      {bookings.length === 0 ? (
        <section className="rounded-lg border bg-white p-8 text-center">
          <h2 className="font-semibold">No bookings found</h2>
          <p className="mt-2 text-sm text-gray-500">
            {status === "ALL"
              ? "You haven't made any resource bookings yet."
              : `You don't have any ${status.toLowerCase()} bookings.`}
          </p>
          <Link
            href="/resources"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Explore available resources
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="space-y-4 rounded-lg border bg-white p-4 sm:p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="font-semibold">{booking.resource.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {booking.resource.type} · {booking.resourceId}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {booking.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="mt-1 font-medium">
                    {formatDate(booking.startTime)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="mt-1 font-medium">
                    {formatTime(booking.startTime)} –{" "}
                    {formatTime(booking.endTime)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Purpose</p>
                  <p className="mt-1 font-medium">{booking.purpose}</p>
                </div>

                <div>
                  <p className="text-gray-500">Ticket ID</p>
                  <p className="mt-1 font-medium">
                    {booking.ticketId ?? "Not associated"}
                  </p>
                </div>
              </div>

              {booking.decisionNote && (
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <p className="font-medium">Admin decision note</p>
                  <p className="mt-1 text-gray-600">
                    {booking.decisionNote}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <p className="text-xs text-gray-500">
                  Requested: {formatDate(booking.createdAt)}
                </p>

                {canCancel(booking.status, booking.startTime) && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelBooking.isPending}
                    className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
            {" · "}
            {pagination.total} bookings
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => current - 1)}
              disabled={pagination.page <= 1}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}