
"use client";

import { useAdminStats } from "@/hooks/use-admin-stats";

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function AdminDashboardPage() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useAdminStats();

  if (isPending) {
    return <main className="p-6">Loading analytics...</main>;
  }

  if (isError || !data) {
    return (
      <main className="space-y-3 p-6">
        <p className="text-red-600">
          {error instanceof Error
            ? error.message
            : "Unable to load analytics."}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Retry
        </button>
      </main>
    );
  }

  const totalBookings = Object.values(data.bookingsByStatus).reduce(
    (sum, count) => sum + count,
    0
  );

  const statuses = Object.entries(data.bookingsByStatus) as [
    keyof typeof data.bookingsByStatus,
    number
  ][];

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of resources, bookings and tickets.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* Overview cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Active Resources"
          value={data.activeResources}
          description="Currently active resources"
        />

        <MetricCard
          title="Total Bookings"
          value={totalBookings}
          description="Across all booking statuses"
        />

        <MetricCard
          title="Total Tickets"
          value={data.ticketStats.totalTickets}
          description="Tickets in the system"
        />
      </section>

      {/* Booking status */}
      <section className="space-y-5 rounded-lg border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Booking Overview</h2>
          <p className="text-sm text-gray-500">
            Distribution of bookings by status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map(([status, count]) => {
            const percentage =
              totalBookings > 0 ? (count / totalBookings) * 100 : 0;

            return (
              <div key={status} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-500">{status}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
                  >
                    {count}
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold">{count}</p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {percentage.toFixed(1)}% of bookings
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top resources */}
      <section className="space-y-4 rounded-lg border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Top Resources</h2>
          <p className="text-sm text-gray-500">
            Resources ranked by booking count.
          </p>
        </div>

        {data.topResources.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No resource booking data available.
          </p>
        ) : (
          <div className="divide-y">
            {data.topResources.map((resource, index) => (
              <div
                key={resource.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-xs text-gray-500">
                      {resource.type}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {resource.bookingCount}
                  </p>
                  <p className="text-xs text-gray-500">Bookings</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}
