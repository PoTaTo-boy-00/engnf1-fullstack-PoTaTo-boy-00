-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BILLING', 'BUG', 'FEATURE_REQUEST', 'LOGIN', 'DELIVERY');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketEventField" AS ENUM ('category', 'priority', 'status', 'assigneeId');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ROOM', 'LAB', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "subject" VARCHAR(150) NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "autoCategory" "TicketCategory" NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "isHumanOverride" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assigneeId" UUID,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_events" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "field" "TicketEventField" NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" VARCHAR(300),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "ticketId" UUID,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "purpose" VARCHAR(200) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "decisionNote" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_externalId_key" ON "tickets"("externalId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_category_idx" ON "tickets"("category");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "tickets_assigneeId_idx" ON "tickets"("assigneeId");

-- CreateIndex
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");

-- CreateIndex
CREATE INDEX "tickets_status_category_priority_idx" ON "tickets"("status", "category", "priority");

-- CreateIndex
CREATE INDEX "ticket_events_ticketId_createdAt_idx" ON "ticket_events"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "resources_name_key" ON "resources"("name");

-- CreateIndex
CREATE INDEX "resources_type_idx" ON "resources"("type");

-- CreateIndex
CREATE INDEX "resources_isActive_idx" ON "resources"("isActive");

-- CreateIndex
CREATE INDEX "resources_type_isActive_idx" ON "resources"("type", "isActive");

-- CreateIndex
CREATE INDEX "bookings_resourceId_startTime_endTime_idx" ON "bookings"("resourceId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "bookings_userId_status_startTime_idx" ON "bookings"("userId", "status", "startTime");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_ticketId_idx" ON "bookings"("ticketId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
