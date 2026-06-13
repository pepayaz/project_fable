"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit-log";
import { getServiceErrorMessage } from "@/lib/services/errors";
import {
  createUser,
  linkUserToStaff,
  setUserActive,
  unlinkUserFromStaff,
  updateUserRole,
} from "@/lib/services/users";

function redirectToUsers(key: "error" | "success", message: string): never {
  redirect(`/users?${key}=${encodeURIComponent(message)}`);
}

export async function createUserAction(formData: FormData) {
  const actor = await requirePermission("users:manage");

  try {
    const user = await createUser({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      temporaryPassword: formData.get("temporaryPassword"),
      linkedStaffId: formData.get("linkedStaffId"),
    });
    await recordAuditLog({
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      summary: `Created user ${user.email} (${user.role})`,
      actor,
    });
  } catch (error) {
    redirectToUsers("error", getServiceErrorMessage(error, "User could not be created."));
  }

  revalidatePath("/users");
  redirectToUsers("success", "User created.");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") ?? "");

  try {
    const user = await updateUserRole(id, { role: formData.get("role") }, actor.id);
    await recordAuditLog({
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `Changed user role for ${user.email} to ${user.role}`,
      actor,
    });
  } catch (error) {
    redirectToUsers("error", getServiceErrorMessage(error, "User role could not be updated."));
  }

  revalidatePath("/users");
  redirectToUsers("success", "User role updated.");
}

export async function setUserActiveAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive")) === "true";

  try {
    const user = await setUserActive(id, isActive, actor.id);
    await recordAuditLog({
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `${user.isActive ? "Activated" : "Deactivated"} user ${user.email}`,
      actor,
    });
  } catch (error) {
    redirectToUsers("error", getServiceErrorMessage(error, "User status could not be updated."));
  }

  revalidatePath("/users");
  redirectToUsers("success", isActive ? "User activated." : "User deactivated and sessions revoked.");
}

export async function linkUserToStaffAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") ?? "");

  try {
    const { user, staff } = await linkUserToStaff(id, {
      linkedStaffId: formData.get("linkedStaffId"),
    });
    await recordAuditLog({
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `Linked user ${user.email} to staff ${staff.name}`,
      actor,
    });
  } catch (error) {
    redirectToUsers("error", getServiceErrorMessage(error, "User could not be linked to staff."));
  }

  revalidatePath("/users");
  redirectToUsers("success", "User linked to staff.");
}

export async function unlinkUserFromStaffAction(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const id = String(formData.get("id") ?? "");

  try {
    const user = await unlinkUserFromStaff(id);
    await recordAuditLog({
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `Unlinked user ${user.email} from staff`,
      actor,
    });
  } catch (error) {
    redirectToUsers("error", getServiceErrorMessage(error, "User could not be unlinked."));
  }

  revalidatePath("/users");
  redirectToUsers("success", "User unlinked from staff.");
}
