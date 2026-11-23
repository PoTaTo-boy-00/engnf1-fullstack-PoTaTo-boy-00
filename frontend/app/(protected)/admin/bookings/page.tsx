
"use client";

import { useState } from "react";
import {
  BookingStatus,
  AdminBookingFilters,
} from "@/types/booking";
import { useAdminBookings, useApproveBooking, useRejectBooking } from "@/hooks/use-admin-bookings";
import { useResources } from "@/hooks/use-resource";

const statuses: BookingStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getStatusStyle(status: BookingStatus) {
  const styles: Record<BookingStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-700",
  };

  return styles[status];
}

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState<AdminBookingFilters>({
    page: 1,
  });

  const [rejectingBookingId, setRejectingBookingId] =
    useState<string | null>(null);

  const [rejectionNote, setRejectionNote] = useState("");
  const [actionError, setActionError] = useState("");

  const {
    data,
    isPending,
    isError,
    isFetching,
    error,
  } = useAdminBookings(filters);

  const { data: resourcesData } = useResources({ page: 1, limit: 100 });

  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  function updateFilter<K extends keyof AdminBookingFilters>(
    key: K,
    value: AdminBookingFilters[K]
  ) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: 1,
    }));
  }

  function handleApprove(id: string) {
    if (!window.confirm("Approve this booking?")) return;

    setActionError("");

    approveBooking.mutate(id, {
      onError: (error) => {
        console.error("Approve booking failed:", error);
        setActionError(
          error instanceof Error
            ? error.message
            : "Unable to approve booking."
        );
      },
    });
  }

  function handleReject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rejectingBookingId) return;

    const note = rejectionNote.trim();

    if (note.length < 5 || note.length > 200) {
      setActionError("Rejection note must contain 5–200 characters.");
      return;
    }

    setActionError("");

    rejectBooking.mutate(
      {
        id: rejectingBookingId,
        note,
      },
      {
        onSuccess: () => {
          setRejectingBookingId(null);
          setRejectionNote("");
        },
        onError: (error) => {
          console.error("Reject booking failed:", error);
          setActionError(
            error instanceof Error
              ? error.message
              : "Unable to reject booking."
          );
        },
      }
    );
  }

  const resources = resourcesData?.data ?? [];

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Admin Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, approve and reject resource booking requests.
        </p>
      </header>

      {/* Filters */}
      <section className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            updateFilter(
              "status",
              (event.target.value || undefined) as BookingStatus | undefined
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.resourceId ?? ""}
          onChange={(event) =>
            updateFilter("resourceId", event.target.value || undefined)
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All resources</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          aria-label="From date"
          value={filters.from ? filters.from.slice(0, 10) : ""}
          onChange={(event) => {
            const value = event.target.value;
            updateFilter(
              "from",
              value
                ? new Date(`${value}T00:00:00`).toISOString()
                : undefined
            );
          }}
          className="rounded-md border px-3 py-2 text-sm"
        />

        <input
          type="date"
          aria-label="To date"
          value={filters.to ? filters.to.slice(0, 10) : ""}
          onChange={(event) => {
            const value = event.target.value;
            updateFilter(
              "to",
              value
                ? new Date(`${value}T23:59:59.999`).toISOString()
                : undefined
            );
          }}
          className="rounded-md border px-3 py-2 text-sm"
        />
      </section>

      {actionError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {/* Rejection form */}
      {rejectingBookingId && (
        <section className="rounded-lg border border-red-200 bg-white p-5">
          <h2 className="font-semibold">Reject booking</h2>
          <p className="mt-1 text-sm text-gray-500">
            A rejection note is required.
          </p>

          <form onSubmit={handleReject} className="mt-4 space-y-3">
            <textarea
              value={rejectionNote}
              onChange={(event) => setRejectionNote(event.target.value)}
              minLength={5}
              maxLength={200}
              required
              rows={3}
              placeholder="Explain why this booking is being rejected..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />

            <p className="text-xs text-gray-500">
              {rejectionNote.length}/200 characters
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={rejectBooking.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {rejectBooking.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRejectingBookingId(null);
                  setRejectionNote("");
                  setActionError("");
                }}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Bookings */}
      <section className="overflow-hidden rounded-lg border bg-white">
        {isPending ? (
          <p className="p-8 text-center text-sm text-gray-500">
            Loading bookings...
          </p>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Unable to load bookings."}
          </p>
        ) : !data?.bookings.length ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No bookings found.
          </p>
        ) : (
          <>
            {isFetching && (
              <p className="border-b bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Updating bookings...
              </p>
            )}

            <div className="divide-y">
              {data.bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="space-y-4 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">
                        {booking.resource?.name ?? "Resource"}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {booking.resource?.type ?? "Unknown type"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Booking ID</p>
                      <p className="break-all font-mono text-xs">
                        {booking.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="break-all font-mono text-xs">
                        {booking.userId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Ticket ID</p>
                      <p className="break-all text-xs">
                        {booking.ticketId ?? "Not linked"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Start</p>
                      <p>{formatDateTime(booking.startTime)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">End</p>
                      <p>{formatDateTime(booking.endTime)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p>{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Purpose</p>
                    <p className="mt-1 text-sm">{booking.purpose}</p>
                  </div>

                  {booking.decisionNote && (
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Decision note</p>
                      <p className="mt-1 text-sm">
                        {booking.decisionNote}
                      </p>
                    </div>
                  )}

                  {booking.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      <button
                        type="button"
                        disabled={
                          approveBooking.isPending ||
                          rejectBooking.isPending
                        }
                        onClick={() => handleApprove(booking.id)}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={
                          approveBooking.isPending ||
                          rejectBooking.isPending
                        }
                        onClick={() => {
                          setRejectingBookingId(booking.id);
                          setRejectionNote("");
                          setActionError("");
                        }}
                        className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {data && (
         <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
  <p className="text-sm text-gray-500">
    Page {data.pagination.page} of {data.pagination.totalPages}
    {" · "}
    {data.pagination.total} bookings
  </p>

  <div className="flex gap-2">
    <button
      type="button"
      disabled={data.pagination.page <= 1 || isFetching}
      onClick={() =>
        updateFilter("page", data.pagination.page - 1)
      }
      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
    >
      Previous
    </button>

    <button
      type="button"
      disabled={
        data.pagination.page >= data.pagination.totalPages ||
        isFetching
      }
      onClick={() =>
        updateFilter("page", data.pagination.page + 1)
      }
      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
    >
      Next
    </button>
  </div>
</footer>
        )}
      </section>
    </main>
  );
}
