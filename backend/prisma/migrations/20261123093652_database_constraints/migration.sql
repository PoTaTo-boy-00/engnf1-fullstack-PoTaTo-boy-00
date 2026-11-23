-- Case-insensitive email uniqueness
CREATE UNIQUE INDEX users_email_lower_unique
ON users (LOWER(email));

-- Case-insensitive resource name uniqueness
CREATE UNIQUE INDEX resources_name_lower_unique
ON resources (LOWER(name));

-- Resource capacity validation
ALTER TABLE resources
ADD CONSTRAINT resource_capacity_check
CHECK (capacity BETWEEN 1 AND 500);

-- Booking time validation
ALTER TABLE bookings
ADD CONSTRAINT booking_time_check
CHECK ("endTime" > "startTime");

-- Enable GiST support for UUID equality
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent overlapping active bookings
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_active_bookings
EXCLUDE USING GIST (
    "resourceId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE (status IN ('PENDING', 'APPROVED'));