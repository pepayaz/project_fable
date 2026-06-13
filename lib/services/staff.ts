import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { staffInputSchema, type StaffInput } from "@/lib/validations/staff";
import type { StaffListParams } from "@/lib/validations/list-filters";

function staffOrderBy(sort: StaffListParams["sort"], dir: StaffListParams["dir"]) {
  switch (sort) {
    case "createdAt":
      return { createdAt: dir };
    case "updatedAt":
      return { updatedAt: dir };
    default:
      return { name: dir };
  }
}

function parseStaffInput(input: unknown): StaffInput {
  const parsed = staffInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the staff form.");
  }

  return parsed.data;
}

export async function listStaff(params?: StaffListParams) {
  return db.staff.findMany({
    where: {
      deletedAt: null,
      ...(params?.q
        ? {
            OR: [
              { name: { contains: params.q } },
              { email: { contains: params.q } },
              { position: { contains: params.q } },
            ],
          }
        : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.department ? { departmentId: params.department } : {}),
    },
    orderBy: staffOrderBy(params?.sort ?? "name", params?.dir ?? "asc"),
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function listStaffOptions() {
  return db.staff.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStaffById(id: string) {
  return db.staff.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getStaffDetailById(id: string) {
  return db.staff.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      tasks: {
        where: { deletedAt: null },
        orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          deadline: true,
        },
      },
      attendances: {
        where: { deletedAt: null },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          eventName: true,
          date: true,
          status: true,
        },
      },
      availabilities: {
        where: { deletedAt: null },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          notes: true,
        },
      },
      performanceNotes: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          category: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function createStaff(input: unknown) {
  const data = parseStaffInput(input);

  return db.staff.create({
    data,
  });
}

async function ensureStaffActive(id: string) {
  const existing = await db.staff.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Staff not found.");
  }
}

export async function updateStaff(id: string, input: unknown) {
  const data = parseStaffInput(input);
  await ensureStaffActive(id);

  return db.staff.update({
    where: { id },
    data,
  });
}

export async function deleteStaff(id: string) {
  await ensureStaffActive(id);

  return db.staff.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
