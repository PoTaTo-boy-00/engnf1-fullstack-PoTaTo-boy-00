"use client";

import { useState } from "react";
import Link from "next/link";
import { useTickets } from "@/hooks/use-tickets";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketFilters,
} from "@/types/tickets";
import { useTicketStats } from "@/hooks/use-ticket-stats";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";
import { useImportTickets } from "@/hooks/use-import-tickets";

export default function DashboardPage() {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isPending, isError, error, isFetching } = useTickets(filters);
  const {
    data: stats,
    isPending: statsLoading,
    isError: statsError,
  } = useTicketStats();
  const tickets = data?.data ?? [];
  const importMutation = useImportTickets();

  const handleImport = () => {
    importMutation.mutate(
      {
        tickets: [
          {
            externalId: "EXT-TEST-001",
            subject: "Refund requested for duplicate invoice payment",
            body: "I was charged twice for the same invoice.",
          },
          {
            externalId: "EXT-TEST-002",
            subject: "Unable to login",
            body: "My account is locked out and I cannot sign in.",
          },
          {
            externalId: "EXT-TEST-003",
            subject: "Package not arrived",
            body: "My package has not arrived despite the expected delivery date.",
          },
        ],
      },
      {
        onSuccess: (result) => {
          toast.success("Feed imported successfully", {
            description: `Imported: ${result.importedCount} | Updated: ${result.updatedCount} | Human overrides preserved: ${result.skippedOverrideCount} | Total: ${result.total}`,
          });
        },
        onError: () => {
          toast.error("Feed import failed. Please try again.");
        },
      },
    );
  };
  function updateFilter<K extends keyof TicketFilters>(
    key: K,
    value: TicketFilters[K],
  ) {
    // console.log("Called")
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: 1,
    }));
  }

  function clearFilters() {
    setFilters({ page: 1, limit: 10 });
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ticket Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage incoming support tickets.
          </p>
        </div>

        <span className="text-sm text-gray-500">
          {data?.total ?? 0} tickets found
        </span>
        <button
          type="button"
          onClick={handleImport}
          disabled={importMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {importMutation.isPending ? "Importing..." : "Re-Import Feed"}
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tickets"
          value={
            stats
              ? Object.values(stats.byStatus).reduce(
                  (sum, count) => sum + count,
                  0,
                )
              : 0
          }
          loading={statsLoading}
        />

        <StatCard
          label="Open Tickets"
          value={stats?.byStatus.OPEN ?? 0}
          loading={statsLoading}
        />

        <StatCard
          label="In Progress"
          value={stats?.byStatus.IN_PROGRESS ?? 0}
          loading={statsLoading}
        />

        <StatCard
          label="Model Agreement Rate"
          value={`${stats?.modelAgreementRate ?? 0}%`}
          loading={statsLoading}
        />
      </section>

      {statsError && (
        <p className="text-sm text-red-600">
          Unable to load ticket statistics.
        </p>
      )}

      {/* Filters */}
      <section className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-4">
        <input
          type="search"
          placeholder="Search tickets..."
          value={filters.q ?? ""}
          onChange={(event) => updateFilter("q", event.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />

        <select
          value={filters.category ?? ""}
          onChange={(event) =>
            updateFilter(
              "category",
              (event.target.value || undefined) as TicketCategory | undefined,
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          <option value="BILLING">Billing</option>
          <option value="BUG">Bug</option>
          <option value="FEATURE_REQUEST">Feature Request</option>
          <option value="LOGIN">Login</option>
          <option value="DELIVERY">Delivery</option>
        </select>

        <select
          value={filters.priority ?? ""}
          onChange={(event) =>
            updateFilter(
              "priority",
              (event.target.value || undefined) as TicketPriority | undefined,
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            updateFilter(
              "status",
              (event.target.value || undefined) as TicketStatus | undefined,
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="text-left text-sm font-medium text-blue-600 hover:underline md:col-span-4"
        >
          Clear filters
        </button>
      </section>

      {/* Ticket table */}
      <section className="overflow-hidden rounded-lg border bg-white">
        {isPending ? (
          <p className="p-8 text-center text-sm text-gray-500">
            Loading tickets...
          </p>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Unable to load tickets."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No tickets found.
          </p>
        ) : (
          <>
            {isFetching && (
              <p className="border-b bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Updating results...
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reviewed</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="max-w-sm px-4 py-3">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {ticket.subject}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">
                          {ticket.externalId}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {ticket.category.replaceAll("_", " ")}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {ticket.priority}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {ticket.status.replaceAll("_", " ")}
                      </td>

                      <td className="px-4 py-3">
                        {ticket.isReviewed ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {data && (
          <footer className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages}
              {" · "}
              {data.total} tickets
            </p>

            <div className="flex gap-2">
              <button
                disabled={filters.page === 1 || isFetching}
                onClick={() =>
                  updateFilter("page", Math.max(1, (filters.page ?? 1) - 1))
                }
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                //   type="button"
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                disabled={!data || data.page >= data.totalPages}
                onClick={() => {
                  setFilters((prev) => {
                    const nextPage = (prev.page ?? 1) + 1;

                    //   console.log("Changing page:", prev.page, "->", nextPage);

                    return {
                      ...prev,
                      page: nextPage,
                    };
                  });
                }}
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
