# AI Usage Disclosure — TriageSync

## 1. AI Tools Used

Two AI tools were used during the development of TriageSync within the two-day assessment window.

| Tool | Usage |
|---|---|
| ChatGPT | Technical discussions, architecture guidance, debugging, API integration, frontend implementation, database concurrency concepts, and documentation assistance |
| OpenAI Codex | Code generation and development assistance, particularly for creating backend integration test files and test scenarios |


## 2. Areas Where AI Assisted

AI tools were used to accelerate development in the following areas:

- Breaking down assessment requirements into implementation tasks.
- Discussing frontend and backend architecture.
- Generating integration test files for backend API functionality.
- Understanding PostgreSQL transactions and concurrency control.
- Debugging API request/response handling and TypeScript errors.
- Improving frontend component structure and form handling.
- Reviewing API contracts and database operations.
- Preparing project documentation.
- Designing and developing the TriageSync marketing landing page, including page structure, visual layout, typography, responsive design, reusable components, and frontend styling.

- Refining the landing page's visual presentation and user experience to maintain a consistent design across different screen sizes.

AI-generated code was reviewed and adapted to the application's actual requirements before integration.

## 3. Instances of Verification and Overriding AI Suggestions

### 3.1 Booking Concurrency: Advisory Locks vs. Row-Level Locks

During the implementation of concurrent booking protection, AI initially suggested using PostgreSQL advisory locks as the synchronization mechanism.

However, the final implementation uses PostgreSQL row-level locking rather than advisory locks.

The implementation was reviewed against the actual booking requirements, and the locking strategy was adapted to use a database row as the synchronization point for competing booking requests.

This ensures that concurrent booking attempts for the same resource are coordinated before checking availability and inserting a booking.

The decision was based on the actual database implementation rather than accepting the initial AI-generated suggestion.

### 3.2 Booking Availability and Transaction Handling

AI-assisted transaction logic initially did not adequately account for the waiting behavior of concurrent transactions and the importance of acquiring the lock before performing the availability check.

A transaction that only checks availability and inserts a booking is not sufficient to prevent race conditions.

The implementation was reviewed to ensure that:

- The relevant resource row is locked inside the transaction.
- Concurrent requests for the same resource wait for the lock to become available.
- Availability is checked after acquiring the lock.
- The booking is inserted within the same transaction.
- Overlapping bookings are rejected with HTTP 409.

This highlighted the importance of understanding actual database transaction behavior rather than relying only on generated transaction code.

### 3.3 Separation of Booking Availability and Booking History

During frontend and API integration, the distinction between resource availability and a user's booking history was clarified.

The availability endpoint is intended to return only the information needed to identify occupied time slots:

```json
{
  "startTime": "...",
  "endTime": "...",
  "status": "PENDING"
}
```

The actual booking history, including booking IDs and resource information, is retrieved separately through:

```http
GET /api/bookings/mine
```

The implementation retained this separation rather than using availability data as a substitute for the user's booking records.

### 3.4 Frontend API Error Handling

During frontend development, an issue was identified where generic or hardcoded error messages were displayed instead of the actual error messages returned by the backend.

For example, the backend returned:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "A record with this value already exists"
  }
}
```

However, the frontend did not consistently extract and display the backend-provided message.

The error-handling implementation was corrected to inspect the Axios error response and extract:

- `error.message` for user-readable feedback.
- `error.code` as a fallback.
- A network-specific message when the backend cannot be reached.

The mutation error callback was also updated to receive the actual error object.

This ensured that frontend feedback reflected the backend's real validation and business-rule responses instead of displaying unrelated generic messages.

## 4. Human Review and Responsibility

AI tools were used as development assistants, not as replacements for implementation decisions or verification.

The developer remained responsible for:

- Reviewing generated code and test files.
- Verifying database transaction behavior.
- Checking API contracts and response structures.
- Validating authorization and role restrictions.
- Testing booking conflict scenarios.
- Correcting generated suggestions that did not match the implementation requirements.
- Making final architectural and implementation decisions.

The final implementation was reviewed against the assessment requirements, with AI-generated suggestions treated as starting points rather than authoritative solutions.