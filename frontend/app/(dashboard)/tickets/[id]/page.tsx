"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTicketById } from "@/hooks/use-tickets";
import { useUpdateTicket } from "@/hooks/use-updated-tickets";
import { useState } from "react";
import { TicketCategory, TicketPriority, TicketStatus } from "@/types/tickets";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: ticket, isPending, isError, error } = useTicketById(id);
  const updateMutation = useUpdateTicket(id);
  console.log(ticket)
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  if (isPending) {
    return <main className="p-6">Loading ticket...</main>;
  }

  if (isError || !ticket) {
    return (
      <main className="space-y-4 p-6">
        <p className="text-red-600">
          {error instanceof Error ? error.message : "Ticket not found."}
        </p>
        <Link href="/dashboard" className="text-blue-600 underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to tickets
      </Link>

      {/* Ticket heading */}
      <section className="rounded-lg border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{ticket.externalId}</p>
            <h1 className="mt-2 text-2xl font-bold">{ticket.subject}</h1>
          </div>

          <span className="rounded-md bg-gray-100 px-3 py-1 text-sm">
            {ticket.status.replaceAll("_", " ")}
          </span>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {ticket.body}
        </p>
      </section>
      <section className="space-y-4 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Update Ticket</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <select
            value={category || ticket.category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="rounded-md border p-2"
          >
            <option value="BILLING">Billing</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE_REQUEST">Feature Request</option>
            <option value="LOGIN">Login</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          <select
            value={priority || ticket.priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="rounded-md border p-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={status || ticket.status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            className="rounded-md border p-2"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => {
            const input = {
              ...(category && category !== ticket.category && { category }),
              ...(priority && priority !== ticket.priority && { priority }),
              ...(status && status !== ticket.status && { status }),
            };

            if (Object.keys(input).length === 0) return;

            updateMutation.mutate(input, {
              onSuccess: () => {
                setCategory("");
                setPriority("");
                setStatus("");
              },
            });
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>

        {updateMutation.isError && (
          <p className="text-sm text-red-600">
            Update failed. Previous values have been restored.
          </p>
        )}
      </section>
      {/* Ticket metadata */}
      <section className="grid gap-4 rounded-lg border bg-white p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Category" value={ticket.category} />
        <Info label="Auto Category" value={ticket.autoCategory} />
        <Info label="Priority" value={ticket.priority} />
        <Info
          label="Human Override"
          value={ticket.isHumanOverride ? "Yes" : "No"}
        />
        <Info label="Reviewed" value={ticket.isReviewed ? "Yes" : "No"} />
        <Info label="Assignee" value={ticket.assigneeId ?? "Unassigned"} />
        <Info
          label="Created"
          value={new Date(ticket.createdAt).toLocaleString()}
        />
        <Info
          label="Last Updated"
          value={new Date(ticket.updatedAt).toLocaleString()}
        />
      </section>

      {/* Audit history */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Audit History</h2>

        {!ticket.events?.length ? (
          <p className="mt-4 text-sm text-gray-500">
            No changes have been recorded yet.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {ticket.events.map((event) => (
              <div key={event.id} className="border-l-2 border-gray-200 pl-4">
                <p className="font-medium">
                  {event.field.replaceAll("_", " ")}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {event.oldValue ?? "Empty"} → {event.newValue ?? "Empty"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  By {event.actor} ·{" "}
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}
