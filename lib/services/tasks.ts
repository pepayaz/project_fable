import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { taskInputSchema, type TaskInput } from "@/lib/validations/task";
import type { TaskListParams } from "@/lib/validations/list-filters";

function taskOrderBy(sort: TaskListParams["sort"], dir: TaskListParams["dir"]) {
  switch (sort) {
    case "priority":
      return { priority: dir };
    case "createdAt":
      return { createdAt: dir };
    case "updatedAt":
      return { updatedAt: dir };
    default:
      return [{ deadline: dir }, { createdAt: "desc" as const }];
  }
}

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

export async function listTasks(params?: TaskListParams) {
  return db.task.findMany({
    where: {
      deletedAt: null,
      ...(params?.q
        ? {
            OR: [
              { title: { contains: params.q } },
              { description: { contains: params.q } },
            ],
          }
        : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.priority ? { priority: params.priority } : {}),
      ...(params?.staff ? { assignedToStaffId: params.staff } : {}),
      ...(params?.department ? { departmentId: params.department } : {}),
    },
    orderBy: taskOrderBy(params?.sort ?? "deadline", params?.dir ?? "asc"),
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

async function ensureTaskActive(id: string) {
  const existing = await db.task.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Task not found.");
  }
}

export async function updateTask(id: string, input: unknown) {
  const data = parseTaskInput(input);
  await ensureTaskActive(id);
  await ensureTaskRelations(data);

  return db.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string) {
  await ensureTaskActive(id);

  return db.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
