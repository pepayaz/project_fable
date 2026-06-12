"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceErrorMessage } from "@/lib/services/errors";
import {
  createPerformanceNote,
  deletePerformanceNote,
  updatePerformanceNote,
} from "@/lib/services/performance-notes";

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
  try {
    await createPerformanceNote(performanceNoteDataFromForm(formData));
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
  const id = String(formData.get("id") ?? "");

  try {
    await updatePerformanceNote(id, performanceNoteDataFromForm(formData));
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
  const id = String(formData.get("id") ?? "");

  try {
    await deletePerformanceNote(id);
  } catch (error) {
    redirectWithError(
      "/performance-notes",
      getServiceErrorMessage(error, "Performance note could not be deleted."),
    );
  }

  revalidatePath("/performance-notes");
  redirect("/performance-notes");
}
