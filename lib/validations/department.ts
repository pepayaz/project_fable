import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable());

export const departmentInputSchema = z.object({
  name: z.string().trim().min(1, "Department name is required.").max(100),
  description: optionalText(500),
});

export type DepartmentInput = z.infer<typeof departmentInputSchema>;
