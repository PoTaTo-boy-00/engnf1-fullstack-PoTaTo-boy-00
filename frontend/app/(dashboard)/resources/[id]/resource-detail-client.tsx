"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useResourceById, useResources } from "@/hooks/use-resource";
import { useResourceAvailability } from "@/hooks/use-resource-availibility";

interface ResourceDetailClientProps {
  id: string;
}
function getUtcDayRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}
export default function ResourceDetailClient({
  id,
}: ResourceDetailClientProps) {
  const [selectedDate, setSelectedDate] = useState("");

  const resourceQuery = useResourceById(id);
  const range = selectedDate
  ? getUtcDayRange(selectedDate)
  : { from: "", to: "" };
  
  const availabilityQuery = useResourceAvailability(id, range.from, range.to);
  
  useEffect(() => {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setSelectedDate(localDate);
  }, []);
  if (resourceQuery.isPending) {
    return <main className="p-6">Loading resource...</main>;
  }

  if (resourceQuery.isError || !resourceQuery.data) {
    return <main className="p-6 text-red-600">Unable to load resource.</main>;
  }

  const resource = resourceQuery.data;
  const bookings = availabilityQuery.data?.bookings ?? [];
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Link href="/resources" className="text-sm text-blue-600 hover:underline">
        ← Back to resources
      </Link>

      <section className="rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-bold">{resource.name}</h1>
        <p className="mt-2 text-gray-600">{resource.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <p>Type: {resource.type}</p>
          <p>Capacity: {resource.capacity}</p>
          <p>Status: {resource.isActive ? "Active" : "Inactive"}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Availability</h2>

        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-md border px-3 py-2"
        />

        {availabilityQuery.isPending ? (
          <p className="text-sm text-gray-500">Loading availability...</p>
        ) : availabilityQuery.isError ? (
          <p className="text-sm text-red-600">Unable to load availability.</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-500">
            No existing bookings for this date.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-md border p-3">
                <p className="font-medium">{booking.status}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(booking.startTime).toLocaleTimeString()} –{" "}
                  {new Date(booking.endTime).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
