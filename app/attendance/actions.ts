"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from "@/lib/services/attendance";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog, summarizeAttendance } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";

function attendanceDataFromForm(formData: FormData) {
  return {
    staffId: formData.get("staffId"),
    eventName: formData.get("eventName"),
    date: formData.get("date"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createAttendanceAction(formData: FormData) {
  const actor = await requirePermission("attendance:create");

  try {
    const attendance = await createAttendance(attendanceDataFromForm(formData));
    await recordAuditLog({
      action: "CREATE",
      entityType: "Attendance",
      entityId: attendance.id,
      summary: summarizeAttendance(attendance),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/attendance/new",
      getServiceErrorMessage(error, "Attendance record could not be created."),
    );
  }

  revalidatePath("/attendance");
  redirect("/attendance");
}

export async function updateAttendanceAction(formData: FormData) {
  const actor = await requirePermission("attendance:update");

  const id = String(formData.get("id") ?? "");

  try {
    const attendance = await updateAttendance(id, attendanceDataFromForm(formData));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "Attendance",
      entityId: attendance.id,
      summary: summarizeAttendance(attendance),
      actor,
    });
  } catch (error) {
    redirectWithError(
      `/attendance/${id}/edit`,
      getServiceErrorMessage(error, "Attendance record could not be updated."),
    );
  }

  revalidatePath("/attendance");
  redirect("/attendance");
}

export async function deleteAttendanceAction(formData: FormData) {
  const actor = await requirePermission("attendance:delete");

  const id = String(formData.get("id") ?? "");

  try {
    const attendance = await deleteAttendance(id);
    await recordAuditLog({
      action: "DELETE",
      entityType: "Attendance",
      entityId: attendance.id,
      summary: summarizeAttendance(attendance),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/attendance",
      getServiceErrorMessage(error, "Attendance record could not be deleted."),
    );
  }

  revalidatePath("/attendance");
  redirect("/attendance");
}
