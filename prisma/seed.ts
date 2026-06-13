import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const LOCAL_QA_PASSWORD = "project-fable-local-rbac-password";
const MIN_PRODUCTION_PASSWORD_LENGTH = 12;
const isProduction = process.env.NODE_ENV === "production";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }).toString("hex");

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

function isWeakProductionPassword(password: string) {
  const lowered = password.toLowerCase();
  return (
    password.length < MIN_PRODUCTION_PASSWORD_LENGTH ||
    lowered.includes("password") ||
    lowered.includes("change-this") ||
    password === LOCAL_QA_PASSWORD
  );
}

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  linkedStaffId?: string;
}

function getSeedAdminConfig(): SeedUser | null {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Project Fable Admin";
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || (!isProduction ? LOCAL_QA_PASSWORD : "");

  if (isProduction) {
    if (!email || !email.includes("@")) {
      throw new Error("SEED_ADMIN_EMAIL must be set to a valid email in production.");
    }
    if (!password) {
      throw new Error("SEED_ADMIN_PASSWORD is required in production.");
    }
    if (isWeakProductionPassword(password)) {
      throw new Error("SEED_ADMIN_PASSWORD is too weak for production.");
    }
  }

  if (!password) {
    return null;
  }

  return {
    id: "user-admin",
    name,
    email: email || "admin@fable.local",
    role: "ADMIN",
    password,
  };
}

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

const tasks = [
  {
    id: "task-1",
    title: "Prepare onboarding materials",
    description: "Create the slide deck for the new batch onboarding.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    assignedToStaffId: "staff-maya-putri",
    departmentId: "dept-human-capital",
  },
  {
    id: "task-2",
    title: "Draft weekly program agenda",
    description: "Outline the key topics for the weekly program sync.",
    status: "TODO",
    priority: "MEDIUM",
    deadline: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
    assignedToStaffId: "staff-nabila-sari",
    departmentId: "dept-program",
  },
  {
    id: "task-3",
    title: "Design campaign posters",
    description: "Create draft versions for the upcoming marketing campaign.",
    status: "TODO",
    priority: "HIGH",
    deadline: null,
    assignedToStaffId: "staff-keisha-amalia",
    departmentId: "dept-creative",
  },
];

const attendances = [
  {
    id: "att-1",
    staffId: "staff-maya-putri",
    eventName: "Weekly Sync",
    date: new Date(),
    status: "PRESENT",
    notes: "On time.",
  },
  {
    id: "att-2",
    staffId: "staff-raka-wijaya",
    eventName: "Weekly Sync",
    date: new Date(),
    status: "LATE",
    notes: "15 minutes late.",
  },
];

const availabilities = [
  {
    id: "avail-1",
    staffId: "staff-maya-putri",
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
  },
  {
    id: "avail-2",
    staffId: "staff-raka-wijaya",
    dayOfWeek: "TUESDAY",
    startTime: "10:00",
    endTime: "15:00",
    notes: "Only available for remote meetings.",
  },
];

const performanceNotes = [
  {
    id: "note-1",
    staffId: "staff-maya-putri",
    category: "GENERAL",
    note: "Excellent work on the onboarding materials this week.",
  },
  {
    id: "note-2",
    staffId: "staff-dimas-pratama",
    category: "GENERAL",
    note: "Needs to improve communication regarding task delays.",
  },
];

async function main() {
  if (!isProduction) {
    for (const dept of departments) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: {
          name: dept.name,
          description: dept.description,
        },
        create: dept,
      });
    }

    for (const member of staff) {
      await prisma.staff.upsert({
        where: { id: member.id },
        update: {
          name: member.name,
          email: member.email,
          phone: member.phone,
          position: member.position,
          status: member.status,
          batch: member.batch,
          notes: member.notes,
          departmentId: member.departmentId,
        },
        create: member,
      });
    }

    for (const task of tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          assignedToStaffId: task.assignedToStaffId,
          departmentId: task.departmentId,
        },
        create: task,
      });
    }

    for (const att of attendances) {
      await prisma.attendance.upsert({
        where: { id: att.id },
        update: {
          staffId: att.staffId,
          eventName: att.eventName,
          date: att.date,
          status: att.status,
          notes: att.notes,
        },
        create: att,
      });
    }

    for (const avail of availabilities) {
      await prisma.availability.upsert({
        where: { id: avail.id },
        update: {
          staffId: avail.staffId,
          dayOfWeek: avail.dayOfWeek,
          startTime: avail.startTime,
          endTime: avail.endTime,
          notes: avail.notes,
        },
        create: avail,
      });
    }

    for (const pNote of performanceNotes) {
      await prisma.performanceNote.upsert({
        where: { id: pNote.id },
        update: {
          staffId: pNote.staffId,
          category: pNote.category,
          note: pNote.note,
        },
        create: pNote,
      });
    }

    console.log(`Seeded ${departments.length} departments, ${staff.length} staff, ${tasks.length} tasks, ${attendances.length} attendances, ${availabilities.length} availabilities, and ${performanceNotes.length} performance notes.`);
  } else {
    console.log("Skipped demo department and staff seed in production.");
  }

  const admin = getSeedAdminConfig();

  if (admin) {
    const qaUsers: SeedUser[] = [admin];

    if (!isProduction) {
      qaUsers.push(
        {
          id: "user-manager",
          name: "Project Fable Manager",
          email: "manager@fable.local",
          role: "MANAGER",
        },
        {
          id: "user-member",
          name: "Project Fable Member",
          email: "member@fable.local",
          role: "MEMBER",
          linkedStaffId: "staff-maya-putri",
        },
      );
    }

    for (const user of qaUsers) {
      const { password, ...userData } = user;
      await prisma.user.upsert({
        where: { email: userData.email.toLowerCase() },
        update: {
          name: userData.name,
          role: userData.role,
          isActive: true,
          linkedStaffId: userData.linkedStaffId ?? null,
          passwordHash: hashPassword(password ?? admin.password!),
        },
        create: {
          ...userData,
          email: userData.email.toLowerCase(),
          isActive: true,
          linkedStaffId: userData.linkedStaffId ?? null,
          passwordHash: hashPassword(password ?? admin.password!),
        },
      });
    }
    
    if (process.env.SEED_ADMIN_PASSWORD) {
      console.log(isProduction ? "Seeded production admin user." : "Seeded RBAC QA users with SEED_ADMIN_PASSWORD.");
    } else if (!isProduction) {
      console.log("Seeded RBAC QA users with local-only fallback password.");
    }
  } else {
    console.log("Skipped user seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
