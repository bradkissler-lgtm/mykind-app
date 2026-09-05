/**
 * Resets the database to a demo-ready state: one institution, one validator,
 * three participants, and a mix of pending/validated/rejected acts — so a
 * design partner walkthrough doesn't start from an empty database (or from
 * whatever ad-hoc rows a previous manual test session left behind).
 *
 * This wipes ALL existing data first — never run against anything but a
 * local/demo database.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo12345";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Delete in FK-safe order: acts reference users and institutions.
  await prisma.act.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const institution = await prisma.institution.create({
    data: { name: "Riverside Community Food Bank" },
  });

  const validator = await prisma.user.create({
    data: {
      name: "Dana Ramirez",
      email: "dana@riverside-demo.org",
      passwordHash,
      role: "VALIDATOR",
      institutionId: institution.id,
    },
  });

  const [priya, marcus, sofia] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Priya Patel",
        email: "priya@example.com",
        passwordHash,
        role: "PARTICIPANT",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Webb",
        email: "marcus@example.com",
        passwordHash,
        role: "PARTICIPANT",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sofia Chen",
        email: "sofia@example.com",
        passwordHash,
        role: "PARTICIPANT",
      },
    }),
  ]);

  await prisma.act.createMany({
    data: [
      {
        description: "Organized the Saturday food pantry shift and trained two new volunteers.",
        participantId: priya.id,
        institutionId: institution.id,
        status: "VALIDATED",
        pillar: "COMMUNITY",
        validatedAt: new Date(),
        validatorId: validator.id,
      },
      {
        description: "Drove an elderly neighbor to their medical appointment after their ride fell through.",
        participantId: priya.id,
        institutionId: institution.id,
        status: "VALIDATED",
        pillar: "COMPASSION",
        validatedAt: new Date(),
        validatorId: validator.id,
      },
      {
        description: "Spoke up when a volunteer was being treated unfairly during intake.",
        participantId: marcus.id,
        institutionId: institution.id,
        status: "REJECTED",
        validatedAt: new Date(),
        validatorId: validator.id,
      },
      {
        description: "Sorted and shelved a full truck delivery ahead of the weekend rush.",
        participantId: marcus.id,
        institutionId: institution.id,
        status: "PENDING",
      },
      {
        description: "Started a weekly carpool so three families without cars could reach the pantry.",
        participantId: sofia.id,
        institutionId: institution.id,
        status: "PENDING",
      },
    ],
  });

  console.log("Seeded demo data:");
  console.log(`  Validator login: dana@riverside-demo.org / ${DEMO_PASSWORD}`);
  console.log(`  Participant logins: priya@example.com, marcus@example.com, sofia@example.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
