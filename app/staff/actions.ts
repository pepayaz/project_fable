"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStaff, deleteStaff, updateStaff } from "@/lib/services/staff";
import { getServiceErrorMessage } from "@/lib/services/errors";

function staffDataFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    status: formData.get("status"),
    batch: formData.get("batch"),
    notes: formData.get("notes"),
    departmentId: formData.get("departmentId"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createStaffAction(formData: FormData) {
  try {
    await createStaff(staffDataFromForm(formData));
  } catch (error) {
    redirectWithError("/staff/new", getServiceErrorMessage(error, "Staff could not be created."));
  }

  revalidatePath("/staff");
  redirect("/staff");
}

export async function updateStaffAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    await updateStaff(id, staffDataFromForm(formData));
  } catch (error) {
    redirectWithError(
      `/staff/${id}/edit`,
      getServiceErrorMessage(error, "Staff could not be updated."),
    );
  }

  revalidatePath("/staff");
  redirect("/staff");
}

export async function deleteStaffAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    await deleteStaff(id);
  } catch (error) {
    redirectWithError("/staff", getServiceErrorMessage(error, "Staff could not be deleted."));
  }

  revalidatePath("/staff");
  redirect("/staff");
}
