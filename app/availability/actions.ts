"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAvailability,
  deleteAvailability,
  updateAvailability,
} from "@/lib/services/availability";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog, summarizeAvailability } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";

function availabilityDataFromForm(formData: FormData) {
  return {
    staffId: formData.get("staffId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: formData.get("notes"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createAvailabilityAction(formData: FormData) {
  const actor = await requirePermission("availability:create");

  try {
    const availability = await createAvailability(availabilityDataFromForm(formData));
    await recordAuditLog({
      action: "CREATE",
      entityType: "Availability",
      entityId: availability.id,
      summary: summarizeAvailability(availability),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/availability/new",
      getServiceErrorMessage(error, "Availability record could not be created."),
    );
  }

  revalidatePath("/availability");
  redirect("/availability");
}

export async function updateAvailabilityAction(formData: FormData) {
  const actor = await requirePermission("availability:update");

  const id = String(formData.get("id") ?? "");

  try {
    const availability = await updateAvailability(id, availabilityDataFromForm(formData));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "Availability",
      entityId: availability.id,
      summary: summarizeAvailability(availability),
      actor,
    });
  } catch (error) {
    redirectWithError(
      `/availability/${id}/edit`,
      getServiceErrorMessage(error, "Availability record could not be updated."),
    );
  }

  revalidatePath("/availability");
  redirect("/availability");
}

export async function deleteAvailabilityAction(formData: FormData) {
  const actor = await requirePermission("availability:delete");

  const id = String(formData.get("id") ?? "");

  try {
    const availability = await deleteAvailability(id);
    await recordAuditLog({
      action: "DELETE",
      entityType: "Availability",
      entityId: availability.id,
      summary: summarizeAvailability(availability),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/availability",
      getServiceErrorMessage(error, "Availability record could not be deleted."),
    );
  }

  revalidatePath("/availability");
  redirect("/availability");
}
