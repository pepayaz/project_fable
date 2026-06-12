"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceErrorMessage } from "@/lib/services/errors";
import {
  createPerformanceNote,
  deletePerformanceNote,
  updatePerformanceNote,
} from "@/lib/services/performance-notes";
import { recordAuditLog, summarizePerformanceNote } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";

function performanceNoteDataFromForm(formData: FormData) {
  return {
    staffId: formData.get("staffId"),
    category: formData.get("category"),
    note: formData.get("note"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createPerformanceNoteAction(formData: FormData) {
  const actor = await requirePermission("performanceNotes:create");

  try {
    const note = await createPerformanceNote(performanceNoteDataFromForm(formData));
    await recordAuditLog({
      action: "CREATE",
      entityType: "PerformanceNote",
      entityId: note.id,
      summary: summarizePerformanceNote(note),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/performance-notes/new",
      getServiceErrorMessage(error, "Performance note could not be created."),
    );
  }

  revalidatePath("/performance-notes");
  redirect("/performance-notes");
}

export async function updatePerformanceNoteAction(formData: FormData) {
  const actor = await requirePermission("performanceNotes:update");

  const id = String(formData.get("id") ?? "");

  try {
    const note = await updatePerformanceNote(id, performanceNoteDataFromForm(formData));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "PerformanceNote",
      entityId: note.id,
      summary: summarizePerformanceNote(note),
      actor,
    });
  } catch (error) {
    redirectWithError(
      `/performance-notes/${id}/edit`,
      getServiceErrorMessage(error, "Performance note could not be updated."),
    );
  }

  revalidatePath("/performance-notes");
  redirect("/performance-notes");
}

export async function deletePerformanceNoteAction(formData: FormData) {
  const actor = await requirePermission("performanceNotes:delete");

  const id = String(formData.get("id") ?? "");

  try {
    const note = await deletePerformanceNote(id);
    await recordAuditLog({
      action: "DELETE",
      entityType: "PerformanceNote",
      entityId: note.id,
      summary: summarizePerformanceNote(note),
      actor,
    });
  } catch (error) {
    redirectWithError(
      "/performance-notes",
      getServiceErrorMessage(error, "Performance note could not be deleted."),
    );
  }

  revalidatePath("/performance-notes");
  redirect("/performance-notes");
}
