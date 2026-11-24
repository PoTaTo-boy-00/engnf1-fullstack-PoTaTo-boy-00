# TriageSync — Technical Solution

# Part A: Architecture and Ticket Processing Flow

## 1. System Architecture

TriageSync follows a layered client-server architecture. The frontend communicates with the backend through REST APIs, while the backend handles authentication, validation, business logic, and database operations.

### Architecture Diagram

```text
                    ┌──────────────────────┐
                    │      USER / ADMIN    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Next.js Frontend  │
                    │                      │
                    │  - Authentication    │
                    │  - Ticket Dashboard  │
                    │  - Ticket Details    │
                    │  - Resource Booking  │
                    │  - Admin Dashboard   │
                    └──────────┬───────────┘
                               │
                         HTTP / REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Express API      │
                    │                      │
                    │  - Authentication    │
                    │  - Authorization     │
                    │  - Validation        │
                    │  - Controllers       │
                    │  - Services          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Prisma ORM      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │                      │
                    │  - Users             │
                    │  - Tickets           │
                    │  - TicketEvents      │
                    │  - Resources         │
                    │  - Bookings          │
                    └──────────────────────┘
```

### Responsibilities of Each Layer

| Layer | Responsibility |
|---|---|
| Next.js | User interface, navigation, forms, API integration, and client-side state |
| Express Routes | Maps HTTP requests to controllers |
| Middleware | Authentication, role authorization, and request processing |
| Controllers | Handles request parameters, invokes services, and returns HTTP responses |
| Services | Contains application business logic and database operations |
| Prisma | Provides type-safe database access |
| PostgreSQL | Persistent storage and transaction management |

The separation between controllers and services keeps HTTP handling separate from business logic.

## 2. Imported Ticket to Dashboard: Execution Flow

The ticket import process takes incoming ticket records, classifies them, persists them, and makes them available through the ticket dashboard.

### Function-by-Function Flow

```text
External / Seeded Ticket Feed
            |
            ▼
POST /api/tickets/import
            |
            ▼
Import Route
            |
            ▼
Import Controller
            |
            ▼
Ticket Import Service
            |
            ├── Identify existing tickets
            |
            ├── Apply classification rules
            |
            ├── Check human overrides
            |
            └── Persist ticket changes
            |
            ▼
       PostgreSQL
            |
            ▼
GET /api/tickets
            |
            ▼
Ticket List Controller / Service
            |
            ├── Apply search filters
            ├── Apply category filters
            ├── Apply priority filters
            ├── Apply status filters
            └── Apply pagination
            |
            ▼
      Ticket Dashboard
```

### Processing Steps

**1. Import request**

The frontend triggers the import operation through:

```http
POST /api/tickets/import
```

The request is received by the ticket import route and forwarded to the corresponding controller.

**2. Import processing**

The controller delegates the processing to the ticket import service.

The service is responsible for identifying incoming records and determining whether each ticket is new or already exists.

**3. Ticket classification**

Incoming tickets are processed using the application's deterministic classification logic.

The classification process assigns the relevant ticket attributes, including category and priority.

**4. Persistence**

The processed records are persisted using Prisma and PostgreSQL.

Repeated imports must not create duplicate ticket records. Existing human-reviewed values must also be protected from being overwritten by automatic classification.

**5. Dashboard retrieval**

The frontend retrieves tickets using:

```http
GET /api/tickets?limit=100
```

The backend applies the requested filters and pagination before returning the results.

The dashboard also retrieves ticket statistics through:

```http
GET /api/stats
```

This keeps the dashboard data backed by the database rather than hardcoded frontend values.

### What Does Reviewed Mean?

A ticket is considered reviewed when a human agent has manually modified its classification field(s), according to the application's human-override tracking mechanism.

The purpose of this distinction is to separate automatic model classification from human decisions.

A human override should be preserved during subsequent imports so that an automated classification does not silently replace an agent's decision.

**Implementation detail to confirm:** Document the exact database field or override flag used to determine reviewed status, and whether a ticket is considered reviewed after any human modification or only after specific fields are changed.

---

# Part B: Concurrency (B6) and Idempotent Human Override (T-B2)

## 1. Booking Concurrency — B6

### Problem

A resource can be requested by multiple users simultaneously.

Checking availability before inserting a booking is not sufficient by itself because two concurrent requests can both observe the same slot as available.

For example:

```text
Transaction A                 Transaction B
-------------                 -------------
Check availability            Check availability
Slot is available              Slot is available
Insert booking                 Insert booking
Commit                         Commit
```

Both transactions could succeed, resulting in overlapping bookings.

This is a race condition.

### Overlap Detection

Two booking intervals overlap when:

```ts
newStart < existingEnd &&
newEnd > existingStart
```

This condition handles the important boundary cases:

| Existing Booking | Requested Booking | Result |
|---|---|---|
| 10:00–11:00 | 10:00–11:00 | Conflict |
| 10:00–11:00 | 10:30–11:30 | Conflict |
| 10:00–11:00 | 11:00–12:00 | Allowed |
| 10:00–11:00 | 09:00–10:00 | Allowed |

Back-to-back bookings are allowed because the intervals do not overlap.

### Implemented Concurrency Protection: Row-Level Locking

TriageSync uses PostgreSQL row-level locking to coordinate concurrent booking requests.

When a booking request arrives, the backend performs the following operations inside a database transaction:

1. Validate the booking request.
2. Acquire a row-level lock on the corresponding resource using `SELECT ... FOR UPDATE`.
3. Check for overlapping bookings with status `PENDING` or `APPROVED`.
4. Check the user's maximum future booking limit.
5. Insert the new booking if all constraints are satisfied.
6. Commit the transaction and release the lock.

The resource row acts as the synchronization point. Concurrent requests attempting to book the same resource must wait until the transaction holding the lock completes.

This prevents two requests from simultaneously passing the availability check and creating overlapping bookings.

The overlap check and insertion are performed within the same transaction, ensuring that the availability check cannot be separated from the booking operation.

If a conflict is detected, the transaction is rejected and the API returns HTTP 409 Conflict.

Otherwise, the booking is created with `PENDING` status.


### Booking Rules

The application enforces the following rules:

- Only `PENDING` and `APPROVED` bookings block a resource slot.
- `REJECTED` and `CANCELLED` bookings do not block availability.
- A user can have at most three future `PENDING` or `APPROVED` bookings.
- A new booking starts in `PENDING` state.
- Booking start and end times must follow the required 30-minute time grid.
- Booking duration must be between 30 and 240 minutes.
- Booking start time must be in the future and within the permitted booking window.
- Invalid booking state transitions are rejected.

### Booking State Transitions

```text
                  ┌───────────┐
                  │  PENDING  │
                  └─────┬─────┘
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
        APPROVED     REJECTED   CANCELLED
             │
             │
             ▼
         CANCELLED
```

Only administrators can approve or reject pending bookings.

Users can cancel their own eligible bookings. The application also checks the booking's start time before allowing state transitions.

### Expected Concurrency Test

The assessment requires simultaneous requests against the same resource and time slot.

For ten concurrent requests:

| Expected result | Count |
|---|---:|
| Successful creation (HTTP 201) | 1 |
| Conflict (HTTP 409) | 9 |

The above represents the expected result, not a claimed test result. Record the actual test output before submission.

---

## 2. Idempotent Human Override — T-B2

### Problem

Ticket imports can occur repeatedly. A ticket that has already been reviewed by a human should not lose its manually assigned values when the same ticket is imported again.

Consider the following scenario:

1. A ticket is imported.
2. Automatic classification assigns its category.
3. A human agent changes the category.
4. The same ticket is imported again.
5. The import process must preserve the human decision.

Without override protection, the import operation could replace the manually assigned category with the automatic classification.

### Expected Processing Flow

```text
             First Import
                  |
                  ▼
        Automatic Classification
                  |
                  ▼
          Persist Ticket
                  |
                  ▼
          Human Agent Edit
                  |
                  ▼
         Store Human Override
                  |
                  ▼
          Re-import Ticket
                  |
                  ▼
        Identify Existing Ticket
                  |
                  ▼
        Check Override Status
                  |
             ┌────┴────┐
             │         │
         Override    No Override
          Exists       Exists
             │         │
             ▼         ▼
        Preserve     Apply New
        Human Value   Classification
```

### Idempotency

The import operation identifies existing tickets using the application's ticket identity/unique-key mechanism.

Repeated imports should update existing records instead of creating duplicate tickets.

The import logic must distinguish between automatically classified fields and fields that have been manually overridden.

This ensures that:

- Repeated imports do not create duplicate records.
- Human-reviewed values remain intact.
- New tickets can still receive automatic classification.
- Automatic updates do not silently overwrite human decisions.

**Implementation detail to confirm:** Insert the exact unique identifier, Prisma operation (`upsert`, update, or other), and override fields used by the actual import service.

---
## 4. Trade-off

Database indexes improve lookup performance for queries that can use them, but they introduce additional costs.

Every index consumes storage and must be maintained when records are inserted, updated, or deleted.

Therefore, adding indexes indiscriminately can increase write overhead without providing meaningful read-performance improvements.

The indexes selected for TriageSync should be justified by the actual filtering and sorting patterns of the ticket listing endpoint.

---

# Part D: What I Would Improve With One More Day

Given another day of development, I would prioritise the following improvements:

| Area | Potential improvement | Expected benefit |
|---|---|---|
| Automated testing | Expand concurrent booking and integration tests | Better confidence in race-condition handling and business rules |
| Ticket imports | Improve import failure recovery and observability | Easier debugging and safer repeated imports |
| Monitoring | Add structured logging and request-level metrics | Faster identification of production issues |
| Analytics | Add richer resource utilisation and ticket-trend reporting | Better operational visibility |
| Frontend | Improve accessibility and loading/error-state consistency | Better usability and reliability |

## Pagination: Offset-Based to Cursor-Based

The current implementation uses offset-based pagination.

For example:

```http
GET /api/tickets?page=10&limit=100
```

The backend calculates the offset using:

```ts
const skip = (page - 1) * limit;
```

This approach is straightforward and works well for smaller datasets. However, as the dataset grows, PostgreSQL may need to scan and discard an increasing number of rows before returning the requested page.

This can introduce unnecessary database work for deeper pages and make pagination progressively less efficient.

### Proposed Improvement: Cursor-Based Pagination

I would consider replacing offset-based pagination with cursor-based pagination for larger datasets.

Instead of calculating an offset, the next request would use the last record's unique, consistently ordered identifier as a cursor.

Example:

```http
GET /api/tickets?limit=100&cursor=<LAST_TICKET_ID>
```

A cursor-based query can retrieve records after the cursor using an indexed ordering key, avoiding the need to skip an increasingly large number of preceding rows.

### Trade-offs

| Offset Pagination | Cursor Pagination |
|---|---|
| Simple to implement | Requires cursor management |
| Supports direct page-number navigation | Better suited to sequential navigation |
| Deep pages can require scanning skipped rows | Can avoid large offset scans with a suitable index |
| Concurrent inserts can shift page boundaries | More stable when navigating a consistently ordered dataset |

Cursor pagination is not a complete replacement for every pagination use case. It makes direct navigation to arbitrary page numbers less convenient and requires a stable ordering strategy, usually involving a unique tie-breaker.

For TriageSync, cursor-based pagination would be worth considering as ticket and booking datasets grow.

### Other Code References

| Improvement | File | Line |
|---|---|---|
| Booking concurrency test coverage | `backend/src/...` | [LINE] |
| Ticket import recovery | `backend/src/...` | [LINE] |
| API logging and monitoring | `backend/src/...` | [LINE] |
| Dashboard analytics | `frontend/src/...` | [LINE] |
| Cursor-based pagination | Ticket listing service and query validation | [LINE] |

These are proposed future improvements, not claims that the functionality is already implemented.
---

# Conclusion

TriageSync combines ticket triage, human-review protection, resource management, and booking workflows in a single full-stack application.

The key engineering considerations are:

1. Maintaining a clear separation between frontend, API, business logic, and persistence.
2. Preserving human decisions during repeated ticket imports.
3. Preventing overlapping bookings under concurrent requests through transaction-based coordination.
4. Enforcing role-based access and valid booking state transitions.
5. Measuring database performance before applying query and indexing optimisations.

The implementation aims to keep business rules enforced by the backend and maintain persistent, consistent application state through PostgreSQL.