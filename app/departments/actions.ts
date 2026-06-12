"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/lib/services/departments";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog, summarizeDepartment } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";

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
  const actor = await requirePermission("departments:create");

  try {
    const department = await createDepartment(departmentDataFromForm(formData));
    await recordAuditLog({
      action: "CREATE",
      entityType: "Department",
      entityId: department.id,
      summary: summarizeDepartment(department),
      actor,
    });
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
  const actor = await requirePermission("departments:update");

  const id = String(formData.get("id") ?? "");

  try {
    const department = await updateDepartment(id, departmentDataFromForm(formData));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "Department",
      entityId: department.id,
      summary: summarizeDepartment(department),
      actor,
    });
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
  const actor = await requirePermission("departments:delete");

  const id = String(formData.get("id") ?? "");

  try {
    const department = await deleteDepartment(id);
    await recordAuditLog({
      action: "DELETE",
      entityType: "Department",
      entityId: department.id,
      summary: summarizeDepartment(department),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/departments",
      getServiceErrorMessage(error, "Department could not be deleted."),
    );
  }

  revalidatePath("/departments");
  redirect("/departments");
}
