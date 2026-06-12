"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTask, deleteTask, updateTask } from "@/lib/services/tasks";
import { getServiceErrorMessage } from "@/lib/services/errors";

function taskDataFromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
    assignedToStaffId: formData.get("assignedToStaffId"),
    departmentId: formData.get("departmentId"),
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createTaskAction(formData: FormData) {
  try {
    await createTask(taskDataFromForm(formData));
  } catch (error) {
    redirectWithError("/tasks/new", getServiceErrorMessage(error, "Task could not be created."));
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTaskAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    await updateTask(id, taskDataFromForm(formData));
  } catch (error) {
    redirectWithError(
      `/tasks/${id}/edit`,
      getServiceErrorMessage(error, "Task could not be updated."),
    );
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function deleteTaskAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    await deleteTask(id);
  } catch (error) {
    redirectWithError("/tasks", getServiceErrorMessage(error, "Task could not be deleted."));
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}
