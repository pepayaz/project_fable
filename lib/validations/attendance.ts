import { z } from "zod";

export const attendanceStatuses = ["PRESENT", "ABSENT", "EXCUSED", "SICK", "LATE"] as const;

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable());

const requiredDate = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date;
}, z.date({ message: "Enter a valid attendance date." }));

export const attendanceInputSchema = z.object({
  staffId: z.string().trim().min(1, "Choose a staff member.").max(100),
  eventName: z.string().trim().min(1, "Event name is required.").max(150),
  date: requiredDate,
  status: z.enum(attendanceStatuses, { message: "Choose a valid attendance status." }),
  notes: optionalText(500),
});

export type AttendanceInput = z.infer<typeof attendanceInputSchema>;
