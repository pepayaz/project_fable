"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit-log";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { restoreTrashRecord } from "@/lib/services/trash";
import { trashEntityTypes, type TrashEntityType } from "@/lib/validations/list-filters";

function redirectToTrash(returnTo: string, key: "error" | "success", message: string): never {
  const target = returnTo.startsWith("/trash") ? returnTo : "/trash";
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}${key}=${encodeURIComponent(message)}`);
}

function parseEntityType(value: FormDataEntryValue | null): TrashEntityType {
  if (typeof value === "string" && (trashEntityTypes as readonly string[]).includes(value)) {
    return value as TrashEntityType;
  }

  throw new Error("Invalid trash entity type.");
}

export async function restoreTrashRecordAction(formData: FormData) {
  const actor = await requirePermission("trash:restore");
  const returnTo = String(formData.get("returnTo") ?? "/trash");
  let successMessage: string | null = null;
  let errorMessage: string | null = null;

  try {
    const entityType = parseEntityType(formData.get("entityType"));
    const id = String(formData.get("id") ?? "");
    const restored = await restoreTrashRecord(entityType, id);

    await recordAuditLog({
      action: "RESTORE",
      entityType: restored.entityType,
      entityId: restored.id,
      summary: restored.summary,
      actor,
    });

    for (const path of restored.revalidatePaths) {
      revalidatePath(path);
    }
    successMessage = restored.summary;
  } catch (error) {
    errorMessage = getServiceErrorMessage(error, "Record could not be restored.");
  }

  if (successMessage) {
    redirectToTrash(returnTo, "success", successMessage);
  }

  redirectToTrash(returnTo, "error", errorMessage ?? "Record could not be restored.");
}
