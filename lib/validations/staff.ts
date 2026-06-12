import { z } from "zod";

export const staffStatuses = ["ACTIVE", "INACTIVE", "PROBATION", "RESIGNED"] as const;

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().email("Enter a valid email address.").max(255).nullable());

export const staffInputSchema = z.object({
  name: z.string().trim().min(1, "Staff name is required.").max(100),
  email: optionalEmail,
  phone: optionalText(50),
  position: optionalText(100),
  status: z.enum(staffStatuses, { message: "Choose a valid staff status." }),
  batch: optionalText(50),
  notes: optionalText(500),
  departmentId: optionalText(100),
});

export type StaffInput = z.infer<typeof staffInputSchema>;
