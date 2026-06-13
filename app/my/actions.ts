"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog, summarizeTask } from "@/lib/services/audit-log";
import { requirePermission } from "@/lib/auth/guards";
import { getMyStaff, updateMyTaskStatus } from "@/lib/services/my-workspace";

function redirectWithError(message: string): never {
  redirect(`/my?error=${encodeURIComponent(message)}`);
}

export async function updateMyTaskStatusAction(formData: FormData) {
  const user = await requirePermission("my:tasks:update");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirectWithError("Your account is not linked to a staff profile.");
  }

  const taskId = String(formData.get("taskId") ?? "");

  try {
    const task = await updateMyTaskStatus(staff.id, taskId, formData.get("status"));
    await recordAuditLog({
      action: "UPDATE",
      entityType: "Task",
      entityId: task.id,
      summary: summarizeTask(task),
      actor: user,
    });
  } catch (error) {
    redirectWithError(getServiceErrorMessage(error, "Task status could not be updated."));
  }

  revalidatePath("/my");
  redirect("/my");
}
