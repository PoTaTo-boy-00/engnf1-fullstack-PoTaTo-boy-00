
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { Priority, TicketCategory, TicketStatus } from './../src/generated/prisma/enums';
import { PrismaClient } from './../src/generated/prisma/client';


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});


const prisma = new PrismaClient({ adapter });
type SeedTicket = {
  externalId: string;
  subject: string;
  body: string;
  category: TicketCategory;
  priority: Priority;
  status: TicketStatus;
  isReviewed?: boolean;
};
async function main() {
  console.log("Starting database seed...");

  // 1. Seed users
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@triagesync.test" },
    update: {
      name: "Admin Lead"
    },
    create: {
      name: "Admin Lead",
      email: "admin@triagesync.test",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@triagesync.test" },
    update: {
      name: "Agent Demo"
    },
    create: {
      name: "Agent Demo",
      email: "user@triagesync.test",
      passwordHash: userPassword,
      role: "USER"
    }
  });

  console.log("Users seeded.");

  // 2. Seed resources
  const resources = [
    {
      name: "Conference Room A",
      type: "ROOM" as const,
      capacity: 10,
      description: "Primary troubleshooting room",
      isActive: true
    },
    {
      name: "Conference Room B",
      type: "ROOM" as const,
      capacity: 6,
      description: "Secondary meeting room",
      isActive: true
    },
    {
      name: "Testing Lab A",
      type: "LAB" as const,
      capacity: 15,
      description: "Software testing laboratory",
      isActive: true
    },
    {
      name: "Testing Lab B",
      type: "LAB" as const,
      capacity: 8,
      description: "Hardware testing laboratory",
      isActive: true
    },
    {
      name: "Diagnostic Equipment A",
      type: "EQUIPMENT" as const,
      capacity: 2,
      description: "Diagnostic workstation",
      isActive: true
    },
    {
      name: "Diagnostic Equipment B",
      type: "EQUIPMENT" as const,
      capacity: 1,
      description: "Currently unavailable equipment",
      isActive: false
    }
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: {
        description: resource.description,
        capacity: resource.capacity,
        isActive: resource.isActive
      },
      create: resource
    });
  }

  console.log("Resources seeded.");

  // 3. Seed tickets
  const tickets:SeedTicket[] = [
    {
      externalId: "SEED-001",
      subject: "Refund not received",
      body: "My refund for the previous payment has not arrived.",
      category: "BILLING",
      priority: "HIGH",
      status: "OPEN",
      isReviewed: true
    },
    {
      externalId: "SEED-002",
      subject: "Invoice contains incorrect charges",
      body: "The invoice shows an incorrect payment amount.",
      category: "BILLING",
      priority: "MEDIUM",
      status: "OPEN"
    },
    {
      externalId: "SEED-003",
      subject: "Application crashes on startup",
      body: "The application throws an error immediately after launch.",
      category: "BUG",
      priority: "HIGH",
      status: "IN_PROGRESS",
      isReviewed: true
    },
    {
      externalId: "SEED-004",
      subject: "Production down",
      body: "The production application is broken and unavailable.",
      category: "BUG",
      priority: "URGENT",
      status: "OPEN"
    },
    {
      externalId: "SEED-005",
      subject: "Request for dark mode",
      body: "Please add a dark mode option to the dashboard.",
      category: "FEATURE_REQUEST",
      priority: "LOW",
      status: "OPEN"
    },
    {
      externalId: "SEED-006",
      subject: "Unable to login",
      body: "My account is locked out and I cannot sign in.",
      category: "LOGIN",
      priority: "URGENT",
      status: "IN_PROGRESS",
      isReviewed: true
    },
    {
      externalId: "SEED-007",
      subject: "Password reset not working",
      body: "The password reset link does not work.",
      category: "LOGIN",
      priority: "MEDIUM",
      status: "OPEN"
    },
    {
      externalId: "SEED-008",
      subject: "Package has not arrived",
      body: "My package has not arrived despite the expected delivery date.",
      category: "DELIVERY",
      priority: "HIGH",
      status: "OPEN"
    },
    {
      externalId: "SEED-009",
      subject: "Shipping tracking unavailable",
      body: "The tracking page does not show my delivery status.",
      category: "DELIVERY",
      priority: "MEDIUM",
      status: "RESOLVED"
    },
    {
      externalId: "SEED-010",
      subject: "Feature request for export",
      body: "Please allow exporting reports as CSV.",
      category: "FEATURE_REQUEST",
      priority: "LOW",
      status: "OPEN"
    },
    {
      externalId: "SEED-011",
      subject: "Unexpected server error",
      body: "The server returns a 500 error when saving settings.",
      category: "BUG",
      priority: "HIGH",
      status: "IN_PROGRESS"
    },
    {
      externalId: "SEED-012",
      subject: "Incorrect subscription charge",
      body: "I was charged twice for the same subscription.",
      category: "BILLING",
      priority: "MEDIUM",
      status: "OPEN"
    },
    {
      externalId: "SEED-013",
      subject: "Two-factor authentication issue",
      body: "I cannot complete the 2fa verification process.",
      category: "LOGIN",
      priority: "MEDIUM",
      status: "CLOSED"
    },
    {
      externalId: "SEED-014",
      subject: "Broken HTML rendering",
      body: "The page contains unexpected formatting.",
      category: "BUG",
      priority: "LOW",
      status: "OPEN"
    },
    {
      externalId: "SEED-015",
      subject: "<script>alert('XSS')</script>",
      body: "Please inspect this payload: <img src=x onerror=alert('XSS')>",
      category: "FEATURE_REQUEST",
      priority: "LOW",
      status: "OPEN"
    }
  ] as const;

  for (const ticket of tickets) {
    const {
      category,
      isReviewed = false,
      ...data
    } = ticket;

    await prisma.ticket.upsert({
      where: { externalId: ticket.externalId },
      update: {
        subject: ticket.subject,
        body: ticket.body
      },
      create: {
        ...data,
        autoCategory: category,
        category,
        isReviewed
      }
    });
  }

  console.log("15 tickets seeded.");

  console.log("Seed completed successfully.");
  console.log("Admin:", admin.email);
  console.log("User:", user.email);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
