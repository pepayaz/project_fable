"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/lib/services/departments";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { requireUser } from "@/lib/auth/session";

function departmentDataFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createDepartmentAction(formData: FormData) {
  await requireUser();

  try {
    await createDepartment(departmentDataFromForm(formData));
  } catch (error) {
    redirectWithError(
      "/departments/new",
      getServiceErrorMessage(error, "Department could not be created."),
    );
  }

  revalidatePath("/departments");
  redirect("/departments");
}

export async function updateDepartmentAction(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id") ?? "");

  try {
    await updateDepartment(id, departmentDataFromForm(formData));
  } catch (error) {
    redirectWithError(
      `/departments/${id}/edit`,
      getServiceErrorMessage(error, "Department could not be updated."),
    );
  }

  revalidatePath("/departments");
  redirect("/departments");
}

export async function deleteDepartmentAction(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id") ?? "");

  try {
    await deleteDepartment(id);
  } catch (error) {
    redirectWithError(
      "/departments",
      getServiceErrorMessage(error, "Department could not be deleted."),
    );
  }

  revalidatePath("/departments");
  redirect("/departments");
}
