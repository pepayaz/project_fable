import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { attendanceInputSchema, type AttendanceInput } from "@/lib/validations/attendance";
import type { AttendanceListParams } from "@/lib/validations/list-filters";

function attendanceOrderBy(sort: AttendanceListParams["sort"], dir: AttendanceListParams["dir"]) {
  switch (sort) {
    case "createdAt":
      return { createdAt: dir };
    default:
      return [{ date: dir }, { createdAt: "desc" as const }];
  }
}

function parseAttendanceInput(input: unknown): AttendanceInput {
  const parsed = attendanceInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the attendance form.");
  }

  return parsed.data;
}

async function ensureStaffExists(staffId: string) {
  const staff = await db.staff.findFirst({
    where: { id: staffId, deletedAt: null },
    select: { id: true },
  });

  if (!staff) {
    throw new ServiceError("Choose a valid staff member.");
  }
}

export async function listAttendanceRecords(params?: AttendanceListParams) {
  return db.attendance.findMany({
    where: {
      deletedAt: null,
      ...(params?.q ? { eventName: { contains: params.q } } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.staff ? { staffId: params.staff } : {}),
    },
    orderBy: attendanceOrderBy(params?.sort ?? "date", params?.dir ?? "desc"),
    include: {
      staff: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getAttendanceById(id: string) {
  return db.attendance.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createAttendance(input: unknown) {
  const data = parseAttendanceInput(input);
  await ensureStaffExists(data.staffId);

  return db.attendance.create({ data });
}

async function ensureAttendanceActive(id: string) {
  const existing = await db.attendance.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Attendance record not found.");
  }
}

export async function updateAttendance(id: string, input: unknown) {
  const data = parseAttendanceInput(input);
  await ensureAttendanceActive(id);
  await ensureStaffExists(data.staffId);

  return db.attendance.update({
    where: { id },
    data,
  });
}

export async function deleteAttendance(id: string) {
  await ensureAttendanceActive(id);

  return db.attendance.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
