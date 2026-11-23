"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useResourceById } from "@/hooks/use-resource";
import { useResourceAvailability } from "@/hooks/use-resource-availibility";
import { useCreateBooking } from "@/hooks/use-create-booking";

interface ResourceDetailClientProps {
  id: string;
}

function getLocalDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getUtcDayRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

function getTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  });
}

function getBookingError(error: unknown) {
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
    "Unable to create booking. Please try again."
  );
}

export default function ResourceDetailClient({
  id,
}: ResourceDetailClientProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resourceQuery = useResourceById(id);

  const range = selectedDate
    ? getUtcDayRange(selectedDate)
    : { from: "", to: "" };

  const availabilityQuery = useResourceAvailability(
    id,
    range.from,
    range.to
  );

  const createBooking = useCreateBooking();

  useEffect(() => {
    const today = new Date();
    setSelectedDate(getLocalDate(today));
  }, []);

  const today = getLocalDate(new Date());

  const maxDate = getLocalDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const bookings = availabilityQuery.data?.bookings ?? [];
  const timeOptions = getTimeOptions();

  const handleBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!selectedDate || !startTime || !endTime || !purpose.trim()) {
      setFormError("Please complete all required fields.");
      return;
    }

    const start = new Date(`${selectedDate}T${startTime}:00`);
    const end = new Date(`${selectedDate}T${endTime}:00`);

    const duration = (end.getTime() - start.getTime()) / 60000;

    if (duration < 30 || duration > 240) {
      setFormError("Booking duration must be between 30 minutes and 4 hours.");
      return;
    }

    if (start.getTime() <= Date.now()) {
      setFormError("Booking must start in the future.");
      return;
    }

    if (start.getTime() > Date.now() + 30 * 24 * 60 * 60 * 1000) {
      setFormError("Booking cannot start more than 30 days ahead.");
      return;
    }

    if (purpose.trim().length < 5 || purpose.trim().length > 200) {
      setFormError("Purpose must contain between 5 and 200 characters.");
      return;
    }

    if (ticketId.trim() && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId.trim())) {
      setFormError("Please enter a valid Ticket ID.");
      return;
    }

    createBooking.mutate(
      {
        resourceId: id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: purpose.trim(),
        ...(ticketId.trim() && { ticketId: ticketId.trim() }),
      },
      {
        onSuccess: () => {
          setSuccessMessage("Booking request submitted successfully.");
          setStartTime("");
          setEndTime("");
          setPurpose("");
          setTicketId("");
        },
        onError: (error) => {
          setFormError(getBookingError(error));
        },
      }
    );
  };

  if (resourceQuery.isPending) {
    return <main className="p-6">Loading resource...</main>;
  }

  if (resourceQuery.isError || !resourceQuery.data) {
    return (
      <main className="p-6 text-red-600">
        Unable to load resource.
      </main>
    );
  }

  const resource = resourceQuery.data;
bookings.map(b=>{
    console.log(b.id)
})
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Link
        href="/resources"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to resources
      </Link>

      {/* Resource details */}
      <section className="rounded-lg border bg-white p-6">
        <h1 className="text-2xl font-bold">{resource.name}</h1>

        <p className="mt-2 text-gray-600">
          {resource.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <p>Type: {resource.type}</p>
          <p>Capacity: {resource.capacity}</p>
          <p>Status: {resource.isActive ? "Active" : "Inactive"}</p>
        </div>
      </section>

      {/* Availability */}
      <section className="space-y-4 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Availability</h2>

        <input
          type="date"
          value={selectedDate}
          min={today}
          max={maxDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-md border px-3 py-2"
        />

        {availabilityQuery.isPending ? (
          <p className="text-sm text-gray-500">
            Loading availability...
          </p>
        ) : availabilityQuery.isError ? (
          <p className="text-sm text-red-600">
            Unable to load availability.
          </p>
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

      {/* Booking form */}
      <section className="space-y-5 rounded-lg border bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold">Book this resource</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a date and time slot to submit a booking request.
          </p>
        </div>

        {!resource.isActive && (
          <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            This resource is inactive and cannot be booked.
          </p>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Booking date *
            </label>

            <input
              type="date"
              value={selectedDate}
              min={today}
              max={maxDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start time *
              </label>

              <select
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  setEndTime("");
                }}
                required
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Select start time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                End time *
              </label>

              <select
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                disabled={!startTime}
                className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select end time</option>
                {timeOptions
                  .filter((time) => {
                    if (!startTime) return false;

                    const startMinutes =
                      Number(startTime.slice(0, 2)) * 60 +
                      Number(startTime.slice(3, 5));

                    const endMinutes =
                      Number(time.slice(0, 2)) * 60 +
                      Number(time.slice(3, 5));

                    return (
                      endMinutes > startMinutes &&
                      endMinutes <= startMinutes + 240
                    );
                  })
                  .map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Purpose *
            </label>

            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              minLength={5}
              maxLength={200}
              required
              rows={3}
              placeholder="Explain why you need this resource"
              className="w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              {purpose.length}/200 characters
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Ticket ID (optional)
            </label>

            <input
              value={ticketId}
              onChange={(event) => setTicketId(event.target.value)}
              placeholder="Enter an associated ticket UUID"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          {successMessage && (
            <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={
              !resource.isActive ||
              !selectedDate ||
              createBooking.isPending
            }
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {createBooking.isPending
              ? "Submitting..."
              : "Request Booking"}
          </button>
        </form>

        <p className="text-xs text-gray-500">
          Booking requests are submitted with PENDING status and require
          approval.
        </p>

        <Link
          href="/bookings"
          className="block text-sm text-blue-600 hover:underline"
        >
          View my bookings →
        </Link>
      </section>
    </main>
  );
}