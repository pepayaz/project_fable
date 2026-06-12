"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from "@/lib/services/attendance";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { requireUser } from "@/lib/auth/session";

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
  await requireUser();

  try {
    await createAttendance(attendanceDataFromForm(formData));
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
  await requireUser();

  const id = String(formData.get("id") ?? "");

  try {
    await updateAttendance(id, attendanceDataFromForm(formData));
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
  await requireUser();

  const id = String(formData.get("id") ?? "");

  try {
    await deleteAttendance(id);
  } catch (error) {
    redirectWithError(
      "/attendance",
      getServiceErrorMessage(error, "Attendance record could not be deleted."),
    );
  }

  revalidatePath("/attendance");
  redirect("/attendance");
}
