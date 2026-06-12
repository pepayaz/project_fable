/* eslint-disable @typescript-eslint/no-require-imports */

require("dotenv/config");

const { randomBytes, scryptSync } = require("node:crypto");
const path = require("node:path");
const Database = require("better-sqlite3");

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }).toString("hex");

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Seed script only supports SQLite file: DATABASE_URL values.");
  }

  const filePath = databaseUrl.slice("file:".length);
  return path.resolve(process.cwd(), filePath);
}

const db = new Database(resolveDatabasePath());
db.pragma("foreign_keys = ON");

const now = new Date().toISOString();

const departments = [
  {
    id: "dept-human-capital",
    name: "Human Capital",
    description: "Coordinates recruitment, onboarding, and staff care.",
  },
  {
    id: "dept-program",
    name: "Program",
    description: "Plans events, initiatives, and committee workflows.",
  },
  {
    id: "dept-creative",
    name: "Creative",
    description: "Handles visuals, content, and publication assets.",
  },
  {
    id: "dept-operations",
    name: "Operations",
    description: "Manages logistics, venue readiness, and field execution.",
  },
];

const staff = [
  {
    id: "staff-maya-putri",
    name: "Maya Putri",
    email: "maya.putri@example.com",
    phone: "0812-1000-1001",
    position: "People Operations Lead",
    status: "ACTIVE",
    batch: "2024",
    notes: "Owns onboarding flow and staff check-ins.",
    departmentId: "dept-human-capital",
  },
  {
    id: "staff-raka-wijaya",
    name: "Raka Wijaya",
    email: "raka.wijaya@example.com",
    phone: "0812-1000-1002",
    position: "Recruitment Coordinator",
    status: "ACTIVE",
    batch: "2025",
    notes: "Coordinates interview scheduling.",
    departmentId: "dept-human-capital",
  },
  {
    id: "staff-nabila-sari",
    name: "Nabila Sari",
    email: "nabila.sari@example.com",
    phone: "0812-1000-1003",
    position: "Program Manager",
    status: "ACTIVE",
    batch: "2024",
    notes: "Leads weekly program planning.",
    departmentId: "dept-program",
  },
  {
    id: "staff-dimas-pratama",
    name: "Dimas Pratama",
    email: "dimas.pratama@example.com",
    phone: "0812-1000-1004",
    position: "Event Planner",
    status: "PROBATION",
    batch: "2026",
    notes: "Recently joined the program team.",
    departmentId: "dept-program",
  },
  {
    id: "staff-keisha-amalia",
    name: "Keisha Amalia",
    email: "keisha.amalia@example.com",
    phone: "0812-1000-1005",
    position: "Creative Director",
    status: "ACTIVE",
    batch: "2024",
    notes: "Maintains publication style and review flow.",
    departmentId: "dept-creative",
  },
  {
    id: "staff-bagus-santoso",
    name: "Bagus Santoso",
    email: "bagus.santoso@example.com",
    phone: "0812-1000-1006",
    position: "Content Designer",
    status: "PROBATION",
    batch: "2026",
    notes: "Supports campaign visuals.",
    departmentId: "dept-creative",
  },
  {
    id: "staff-aliya-ramadhani",
    name: "Aliya Ramadhani",
    email: "aliya.ramadhani@example.com",
    phone: "0812-1000-1007",
    position: "Operations Coordinator",
    status: "ACTIVE",
    batch: "2025",
    notes: "Tracks equipment and event logistics.",
    departmentId: "dept-operations",
  },
  {
    id: "staff-farhan-hakim",
    name: "Farhan Hakim",
    email: "farhan.hakim@example.com",
    phone: "0812-1000-1008",
    position: "Logistics Staff",
    status: "ACTIVE",
    batch: "2025",
    notes: "Handles venue setup and inventory.",
    departmentId: "dept-operations",
  },
  {
    id: "staff-sinta-maharani",
    name: "Sinta Maharani",
    email: "sinta.maharani@example.com",
    phone: "0812-1000-1009",
    position: "Staff Engagement Associate",
    status: "INACTIVE",
    batch: "2023",
    notes: "Temporarily inactive this semester.",
    departmentId: "dept-human-capital",
  },
  {
    id: "staff-yusuf-maulana",
    name: "Yusuf Maulana",
    email: "yusuf.maulana@example.com",
    phone: "0812-1000-1010",
    position: "Program Associate",
    status: "INACTIVE",
    batch: "2023",
    notes: "On academic leave.",
    departmentId: "dept-program",
  },
];

const upsertDepartment = db.prepare(`
  INSERT INTO Department (id, name, description, createdAt, updatedAt)
  VALUES (@id, @name, @description, @createdAt, @updatedAt)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    updatedAt = excluded.updatedAt
`);

const upsertStaff = db.prepare(`
  INSERT INTO Staff (
    id,
    name,
    email,
    phone,
    position,
    status,
    batch,
    notes,
    departmentId,
    createdAt,
    updatedAt
  )
  VALUES (
    @id,
    @name,
    @email,
    @phone,
    @position,
    @status,
    @batch,
    @notes,
    @departmentId,
    @createdAt,
    @updatedAt
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    position = excluded.position,
    status = excluded.status,
    batch = excluded.batch,
    notes = excluded.notes,
    departmentId = excluded.departmentId,
    updatedAt = excluded.updatedAt
`);

const upsertAdminUser = db.prepare(`
  INSERT INTO User (
    id,
    name,
    email,
    passwordHash,
    role,
    isActive,
    createdAt,
    updatedAt
  )
  VALUES (
    @id,
    @name,
    @email,
    @passwordHash,
    @role,
    @isActive,
    @createdAt,
    @updatedAt
  )
  ON CONFLICT(email) DO UPDATE SET
    name = excluded.name,
    passwordHash = excluded.passwordHash,
    role = excluded.role,
    isActive = excluded.isActive,
    updatedAt = excluded.updatedAt
`);

const seed = db.transaction(() => {
  for (const department of departments) {
    upsertDepartment.run({
      ...department,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const member of staff) {
    upsertStaff.run({
      ...member,
      createdAt: now,
      updatedAt: now,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    upsertAdminUser.run({
      id: "user-admin",
      name: process.env.SEED_ADMIN_NAME?.trim() || "Project Fable Admin",
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    });
  }
});

seed();
db.close();

console.log(`Seeded ${departments.length} departments and ${staff.length} staff.`);

if (process.env.SEED_ADMIN_EMAIL?.trim() && process.env.SEED_ADMIN_PASSWORD) {
  console.log(`Seeded admin user ${process.env.SEED_ADMIN_EMAIL.trim().toLowerCase()}.`);
} else {
  console.log(
    "Skipped admin user seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.",
  );
}
