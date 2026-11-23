
"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ResourceFilters,
  ResourceType,
} from "@/types/resource";
import { useResources } from "@/hooks/use-resource";

export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isPending, isError, isFetching, error } =
    useResources(filters);

  function updateFilter<K extends keyof ResourceFilters>(
    key: K,
    value: ResourceFilters[K]
  ) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: 1,
    }));
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find and manage available resources.
        </p>
      </header>

      {/* Filters */}
      <section className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
        <input
          type="search"
          placeholder="Search resources..."
          value={filters.search ?? ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />

        <select
          value={filters.type ?? ""}
          onChange={(e) =>
            updateFilter(
              "type",
              (e.target.value || undefined) as ResourceType | undefined
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="ROOM">Room</option>
          <option value="LAB">Lab</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Minimum capacity"
          value={filters.minCapacity ?? ""}
          onChange={(e) =>
            updateFilter(
              "minCapacity",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="rounded-md border px-3 py-2 text-sm"
        />
      </section>

      {/* Results */}
      <section className="overflow-hidden rounded-lg border bg-white">
        {isPending ? (
          <p className="p-8 text-center text-sm text-gray-500">
            Loading resources...
          </p>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Unable to load resources."}
          </p>
        ) : !data?.data.length ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No resources found.
          </p>
        ) : (
          <>
            {isFetching && (
              <p className="border-b bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Updating results...
              </p>
            )}

            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="rounded-lg border p-4 transition hover:border-blue-400 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">
                      {resource.name}
                    </h2>

                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      {resource.type}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    {resource.description}
                  </p>

                  <div className="mt-4 flex justify-between text-sm">
                    <span>Capacity: {resource.capacity}</span>
                    <span className={resource.isActive ? "text-green-600" : "text-red-600"}>
                      {resource.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {data && (
          <footer className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages} · {data.total} resources
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.page <= 1 || isFetching}
                onClick={() => updateFilter("page", data.page - 1)}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={data.page >= data.totalPages || isFetching}
                onClick={() => updateFilter("page", data.page + 1)}
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
