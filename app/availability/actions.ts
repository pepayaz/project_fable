"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAvailability,
  deleteAvailability,
  updateAvailability,
} from "@/lib/services/availability";
import { getServiceErrorMessage } from "@/lib/services/errors";

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
  try {
    await createAvailability(availabilityDataFromForm(formData));
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
  const id = String(formData.get("id") ?? "");

  try {
    await updateAvailability(id, availabilityDataFromForm(formData));
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
  const id = String(formData.get("id") ?? "");

  try {
    await deleteAvailability(id);
  } catch (error) {
    redirectWithError(
      "/availability",
      getServiceErrorMessage(error, "Availability record could not be deleted."),
    );
  }

  revalidatePath("/availability");
  redirect("/availability");
}
