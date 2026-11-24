
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ResourceFilters,
  ResourceType,
  CreateResourceInput,
  UpdateResourceInput,
  Resource,
} from "@/types/resource";
import { useResources } from "@/hooks/use-resource";
import {
  useCreateResource,
  useUpdateResource,
} from "@/hooks/use-resource-mutations";
import { getApiError } from "@/lib/get-api-error";

const initialForm: CreateResourceInput = {
  name: "",
  type: "ROOM",
  capacity: 1,
  description: "",
};

export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFilters>({
    page: 1,
    limit: 10,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] =
    useState<Resource | null>(null);
  const [form, setForm] = useState<CreateResourceInput>(initialForm);
  const [formError, setFormError] = useState("");

  const { data: authData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get<{ user: { role: string } }>("/auth/me");
      return response.data;
    },
  });

  const isAdmin = authData?.user.role === "ADMIN";

  const { data, isPending, isError, isFetching, error } =
    useResources(filters);

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

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

  function openCreateForm() {
    setEditingResource(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(resource: Resource) {
    setEditingResource(resource);
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      description: resource.description ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingResource(null);
    setForm(initialForm);
    setFormError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (form.name.trim().length < 3) {
      setFormError("Resource name must contain at least 3 characters.");
      return;
    }

    if (
      !Number.isInteger(Number(form.capacity)) ||
      Number(form.capacity) < 1 ||
      Number(form.capacity) > 500
    ) {
      setFormError("Capacity must be between 1 and 500.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      capacity: Number(form.capacity),
      description: form.description?.trim() || null,
    };

    if (editingResource) {
      updateResource.mutate(
        {
          id: editingResource.id,
          data: payload as UpdateResourceInput,
        },
        {
          onSuccess: closeForm,
          onError: (error) =>
          setFormError(getApiError(error))
        }
      );
    } else {
      createResource.mutate(payload, {
        onSuccess: closeForm,
        onError: (error) =>
          setFormError(getApiError(error))
      });
    }
  }

  function toggleResource(resource: Resource) {
    const action = resource.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${resource.name}"?`
      )
    ) {
      return;
    }

    updateResource.mutate({
      id: resource.id,
      data: { isActive: !resource.isActive },
    });
  }

  const isSaving = createResource.isPending || updateResource.isPending;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find and manage available resources.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create Resource
          </button>
        )}
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

      {/* Resource Form */}
      {showForm && isAdmin && (
        <section className="rounded-lg border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingResource ? "Edit Resource" : "Create Resource"}
            </h2>

            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Resource name
              </label>
              <input
                required
                minLength={3}
                maxLength={60}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g. Conference Room C"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Resource type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as ResourceType,
                    })
                  }
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="ROOM">Room</option>
                  <option value="LAB">Lab</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capacity: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                maxLength={300}
                rows={3}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2"
                placeholder="Optional resource description"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingResource
                    ? "Save Changes"
                    : "Create Resource"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Resource Results */}
      <section className="overflow-hidden rounded-lg border bg-white">
        {isPending ? (
          <p className="p-8 text-center text-sm text-gray-500">
            Loading resources...
          </p>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-red-600">
            {
              getApiError(error)
            }
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
                <article
                  key={resource.id}
                  className="rounded-lg border p-4 transition hover:border-blue-400 hover:shadow-sm"
                >
                  <Link href={`/resources/${resource.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold">{resource.name}</h2>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                        {resource.type}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      {resource.description || "No description available."}
                    </p>

                    <div className="mt-4 flex justify-between text-sm">
                      <span>Capacity: {resource.capacity}</span>
                      <span
                        className={
                          resource.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {resource.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </Link>

                  {isAdmin && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(resource)}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={updateResource.isPending}
                        onClick={() => toggleResource(resource)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                          resource.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {resource.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {data && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
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
