import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { taskInputSchema, type TaskInput } from "@/lib/validations/task";

function parseTaskInput(input: unknown): TaskInput {
  const parsed = taskInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the task form.");
  }

  return parsed.data;
}

async function ensureTaskRelations(input: TaskInput) {
  if (input.assignedToStaffId) {
    const staffExists = await db.staff.findFirst({
      where: { id: input.assignedToStaffId, deletedAt: null },
      select: { id: true },
    });

    if (!staffExists) {
      throw new ServiceError("Choose a valid staff assignee.");
    }
  }

  if (input.departmentId) {
    const departmentExists = await db.department.findFirst({
      where: { id: input.departmentId, deletedAt: null },
      select: { id: true },
    });

    if (!departmentExists) {
      throw new ServiceError("Choose a valid department.");
    }
  }
}

export async function listTasks() {
  return db.task.findMany({
    where: { deletedAt: null },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    include: {
      assignedToStaff: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getTaskById(id: string) {
  return db.task.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createTask(input: unknown) {
  const data = parseTaskInput(input);
  await ensureTaskRelations(data);

  return db.task.create({ data });
}

export async function updateTask(id: string, input: unknown) {
  const data = parseTaskInput(input);
  await ensureTaskRelations(data);

  return db.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string) {
  return db.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
