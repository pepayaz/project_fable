import { z } from "zod";

export const daysOfWeek = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable());

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.");

export const availabilityInputSchema = z
  .object({
    staffId: z.string().trim().min(1, "Choose a staff member.").max(100),
    dayOfWeek: z.enum(daysOfWeek, { message: "Choose a valid day." }),
    startTime: timeSchema,
    endTime: timeSchema,
    notes: optionalText(500),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time.",
    path: ["endTime"],
  });

export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;
