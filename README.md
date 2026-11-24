# TriageSync

## 1. Overview

TriageSync is a full-stack support ticket triage and resource booking platform.

The application enables users to:

- View and filter support tickets.
- Review ticket classifications and update ticket details.
- Browse resources and check availability.
- Create, view, and cancel resource bookings.

Administrators can:

- Manage resources and their availability.
- Review, approve, and reject booking requests.
- Monitor booking statistics and resource usage.

The platform uses PostgreSQL for persistent storage, an Express API for backend operations, and Next.js for the frontend.

## 2. Live Links

| Service           | URL                           |
| ----------------- | ----------------------------- |
| Frontend          | [ADD FRONTEND DEPLOYMENT URL] |
| Backend API       | [ADD BACKEND DEPLOYMENT URL]  |
| GitHub Repository | [ADD PUBLIC REPOSITORY URL]   |

## 3. Seeded Credentials

The following accounts are created by the seed script.

| Role  | Email                                                  | Password   |
| ----- | ------------------------------------------------------ | ---------- |
| ADMIN | [admin@triagesync.test](mailto\:admin@triagesync.test) | Admin\@123 |
| USER  | [user@triagesync.test](mailto\:user@triagesync.test)   | User\@123  |

These are assessment/demo credentials. Do not use these passwords for production accounts.

## 4. Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Axios
- Sonner
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Zod validation

### Database and Infrastructure

- PostgreSQL hosted on [ADD PROVIDER]
- Frontend hosting: [ADD PROVIDER]
- Backend hosting: [ADD PROVIDER]

## 5. Folder Structure

```text
TriageSync/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── ...
│   └── package.json
│
├── README.md
├── SOLUTION.md
├── AI_USAGE.md
├── .gitignore
└── .env.example
```

Update this tree to match the actual repository before submission.

## 6. Local Setup and Idempotent Seed Command

### Prerequisites

- Node.js [ADD VERSION]
- npm
- PostgreSQL database
- Git

### Clone the repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd [YOUR_REPOSITORY_NAME]
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Configure the required environment variables:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
FRONTEND_URL=
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Run the seed command:

```bash
[ADD EXACT SEED COMMAND FROM backend/package.json]
```

The seed operation is designed to be idempotent: running it multiple times should not create duplicate seed records.

Start the backend:

```bash
npm run dev
```

### Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=
```

Start the frontend:

```bash
npm run dev
```

The frontend should now be accessible at `http://localhost:3000`.

## 7. Database Schema

The application uses PostgreSQL with Prisma ORM.

Core entities:

| Entity      | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| User        | Stores user identity, credentials, and role            |
| Ticket      | Stores imported support tickets and triage information |
| TicketEvent | Maintains ticket change/audit history                  |
| Resource    | Stores rooms, labs, and equipment                      |
| Booking     | Stores resource booking requests and decisions         |

### Relationships

- A user can create multiple bookings.
- A resource can have multiple bookings.
- A booking can optionally reference a ticket.
- A ticket can have multiple audit events.
- Ticket events record changes and the actor responsible.

See `backend/prisma/schema.prisma` for the authoritative schema.

## 8. API Summary

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Register a USER account |
| POST   | `/auth/login`    | Authenticate a user     |
| GET    | `/auth/me`       | Get current user        |

### Tickets

| Method | Endpoint          | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/tickets/import` | Import ticket feed                   |
| GET    | `/tickets`        | List and filter tickets              |
| GET    | `/tickets/:id`    | Get ticket details and audit history |
| PATCH  | `/tickets/:id`    | Update ticket fields                 |
| GET    | `/stats`          | Get ticket statistics                |

### Resources

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| GET    | `/resources`                  | List resources            |
| GET    | `/resources/:id`              | Get resource details      |
| POST   | `/resources`                  | Create resource (ADMIN)   |
| PATCH  | `/resources/:id`              | Update resource (ADMIN)   |
| GET    | `/resources/:id/availability` | Get resource availability |

### Bookings

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/bookings`             | Create booking              |
| GET    | `/bookings/mine`        | Get current user's bookings |
| GET    | `/bookings/:id`         | Get booking details         |
| GET    | `/bookings`             | List all bookings (ADMIN)   |
| PATCH  | `/bookings/:id/cancel`  | Cancel own booking          |
| PATCH  | `/bookings/:id/approve` | Approve booking (ADMIN)     |
| PATCH  | `/bookings/:id/reject`  | Reject booking (ADMIN)      |

### Admin Analytics

| Method | Endpoint       | Description                           |
| ------ | -------------- | ------------------------------------- |
| GET    | `/admin/stats` | Get administrative statistics (ADMIN) |

All protected endpoints require authentication. Administrative operations additionally require the ADMIN role.

## 9. Completed Features Checklist

### Authentication

- [x] User registration
- [x] User login
- [x] JWT-based authentication
- [x] Role-based authorization
- [x] Production deployment verification

### Ticket Triage

- [x] Ticket listing
- [x] Search and filters
- [x] Ticket detail view
- [x] Ticket updates
- [x] Audit history
- [x] Optimistic frontend updates with rollback
- [x] Ticket statistics
- [x] Verify import idempotency and human-override preservation

### Resource Management

- [x] Resource listing
- [x] Search and filtering
- [x] Pagination
- [x] Resource detail and availability
- [x] Admin resource creation and updates
- [x] Resource activation/deactivation

### Booking Management

- [x] Create booking
- [x] View own bookings
- [x] Cancel booking
- [x] Admin booking listing
- [x] Approve/reject booking
- [x] Verify concurrent booking race-condition handling
- [x] Verify booking lifecycle edge cases

### Analytics

- [x] Admin analytics dashboard
- [x] Booking status statistics
- [x] Top resource usage

### Deployment and Quality

- [x] Frontend deployment
- [x] Backend deployment
- [x] Hosted database configuration
- [x] Production environment verification
- [x] Responsive layout verification
- [x] Final end-to-end testing

Update this checklist to reflect only features that have actually been verified.

## 10. Known Limitations

-  external ticket feed integration, The application currently uses seeded demo credentials for assessment evaluation.
- email notification not implemented
- [ADD LIMITATION: e.g. reporting/export capabilities, if not implemented]
- [ADD ANY OTHER VERIFIED LIMITATIONS]

