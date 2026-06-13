"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog, summarizeAvailability } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";
import {
  createMyAvailability,
  deleteMyAvailability,
  getMyStaff,
  updateMyAvailability,
} from "@/lib/services/my-workspace";

function availabilityDataFromForm(formData: FormData) {
  return {
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: formData.get("notes"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createMyAvailabilityAction(formData: FormData) {
  const user = await requirePermission("my:availability:manage");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirectWithError("/my", "Your account is not linked to a staff profile.");
  }

  try {
    const record = await createMyAvailability(staff.id, availabilityDataFromForm(formData));
    await recordAuditLog({
      action: "CREATE",
      entityType: "Availability",
      entityId: record.id,
      summary: summarizeAvailability(record),
      actor: user,
    });
  } catch (error) {
    redirectWithError(
      "/my/availability/new",
      getServiceErrorMessage(error, "Availability could not be created."),
    );
  }

  revalidatePath("/my");
  redirect("/my");
}

export async function updateMyAvailabilityAction(formData: FormData) {
  const user = await requirePermission("my:availability:manage");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirectWithError("/my", "Your account is not linked to a staff profile.");
  }

  const id = String(formData.get("id") ?? "");

  try {
    const record = await updateMyAvailability(staff.id, id, availabilityDataFromForm(formData));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "Availability",
      entityId: record.id,
      summary: summarizeAvailability(record),
      actor: user,
    });
  } catch (error) {
    redirectWithError(
      `/my/availability/${id}/edit`,
      getServiceErrorMessage(error, "Availability could not be updated."),
    );
  }

  revalidatePath("/my");
  redirect("/my");
}

export async function deleteMyAvailabilityAction(formData: FormData) {
  const user = await requirePermission("my:availability:manage");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirectWithError("/my", "Your account is not linked to a staff profile.");
  }

  const id = String(formData.get("id") ?? "");

  try {
    const record = await deleteMyAvailability(staff.id, id);
    await recordAuditLog({
      action: "DELETE",
      entityType: "Availability",
      entityId: record.id,
      summary: summarizeAvailability(record),
      actor: user,
    });
  } catch (error) {
    redirectWithError("/my", getServiceErrorMessage(error, "Availability could not be deleted."));
  }

  revalidatePath("/my");
  redirect("/my");
}
