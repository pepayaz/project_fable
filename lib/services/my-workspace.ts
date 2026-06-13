import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { availabilityInputSchema } from "@/lib/validations/availability";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";
import type { AuthUser } from "@/lib/auth/session";

const MEMBER_TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export async function getMyStaff(user: Pick<AuthUser, "linkedStaffId">) {
  if (!user.linkedStaffId) {
    return null;
  }

  return db.staff.findFirst({
    where: { id: user.linkedStaffId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      position: true,
      status: true,
      batch: true,
      department: { select: { name: true } },
    },
  });
}

export async function getMyWorkspace(staffId: string) {
  const [tasks, attendances, availabilities, performanceByCategoryRows] = await Promise.all([
    db.task.findMany({
      where: { assignedToStaffId: staffId, deletedAt: null },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      select: { id: true, title: true, status: true, priority: true, deadline: true },
    }),
    db.attendance.findMany({
      where: { staffId, deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { id: true, eventName: true, date: true, status: true, notes: true },
    }),
    db.availability.findMany({
      where: { staffId, deletedAt: null },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      select: { id: true, dayOfWeek: true, startTime: true, endTime: true, notes: true },
    }),
    db.performanceNote.groupBy({
      by: ["category"],
      where: { staffId, deletedAt: null },
      _count: true,
    }),
  ]);

  const counts = Object.fromEntries(
    performanceByCategoryRows.map((row) => [row.category, row._count]),
  );
  const performanceByCategory = performanceNoteCategories.map((category) => ({
    category,
    count: counts[category] ?? 0,
  }));

  return { tasks, attendances, availabilities, performanceByCategory };
}

export async function getMyAvailabilityById(staffId: string, id: string) {
  return db.availability.findFirst({
    where: { id, staffId, deletedAt: null },
  });
}

function parseMyAvailability(staffId: string, input: unknown) {
  const parsed = availabilityInputSchema.safeParse({
    ...(input as Record<string, unknown>),
    staffId,
  });

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the availability form.");
  }

  return parsed.data;
}

async function ensureOwnedAvailability(staffId: string, id: string) {
  const existing = await db.availability.findFirst({
    where: { id, staffId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Availability record not found.");
  }
}

export async function createMyAvailability(staffId: string, input: unknown) {
  const data = parseMyAvailability(staffId, input);

  return db.availability.create({ data });
}

export async function updateMyAvailability(staffId: string, id: string, input: unknown) {
  await ensureOwnedAvailability(staffId, id);
  const data = parseMyAvailability(staffId, input);

  return db.availability.update({
    where: { id },
    data,
  });
}

export async function deleteMyAvailability(staffId: string, id: string) {
  await ensureOwnedAvailability(staffId, id);

  return db.availability.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function updateMyTaskStatus(staffId: string, taskId: string, status: unknown) {
  if (typeof status !== "string" || !MEMBER_TASK_STATUSES.includes(status)) {
    throw new ServiceError("Choose a valid task status.");
  }

  const existing = await db.task.findFirst({
    where: { id: taskId, assignedToStaffId: staffId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Task not found.");
  }

  return db.task.update({
    where: { id: taskId },
    data: { status },
    select: { id: true, title: true },
  });
}
