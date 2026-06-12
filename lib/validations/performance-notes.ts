import { z } from "zod";

export const performanceNoteCategories = [
  "POSITIVE",
  "IMPROVEMENT",
  "WARNING",
  "GENERAL",
] as const;

export const performanceNoteInputSchema = z.object({
  staffId: z.string().trim().min(1, "Choose a staff member.").max(100),
  category: z.enum(performanceNoteCategories, {
    message: "Choose a valid performance note category.",
  }),
  note: z.string().trim().min(1, "Note is required.").max(1000),
});

export type PerformanceNoteInput = z.infer<typeof performanceNoteInputSchema>;
