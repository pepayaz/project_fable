import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { attendanceInputSchema, type AttendanceInput } from "@/lib/validations/attendance";

function parseAttendanceInput(input: unknown): AttendanceInput {
  const parsed = attendanceInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the attendance form.");
  }

  return parsed.data;
}

async function ensureStaffExists(staffId: string) {
  const staff = await db.staff.findUnique({
    where: { id: staffId },
    select: { id: true },
  });

  if (!staff) {
    throw new ServiceError("Choose a valid staff member.");
  }
}

export async function listAttendanceRecords() {
  return db.attendance.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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
  return db.attendance.findUnique({
    where: { id },
  });
}

export async function createAttendance(input: unknown) {
  const data = parseAttendanceInput(input);
  await ensureStaffExists(data.staffId);

  return db.attendance.create({ data });
}

export async function updateAttendance(id: string, input: unknown) {
  const data = parseAttendanceInput(input);
  await ensureStaffExists(data.staffId);

  return db.attendance.update({
    where: { id },
    data,
  });
}

export async function deleteAttendance(id: string) {
  return db.attendance.delete({
    where: { id },
  });
}
