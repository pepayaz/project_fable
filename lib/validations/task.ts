import { z } from "zod";

export const taskStatuses = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED", "CANCELLED"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable());

const optionalDate = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date;
}, z.date({ message: "Enter a valid deadline." }).nullable());

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Task title is required.").max(150),
  description: optionalText(1000),
  status: z.enum(taskStatuses, { message: "Choose a valid task status." }),
  priority: z.enum(taskPriorities, { message: "Choose a valid task priority." }),
  deadline: optionalDate,
  assignedToStaffId: optionalText(100),
  departmentId: optionalText(100),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
