import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import {
  performanceNoteInputSchema,
  type PerformanceNoteInput,
} from "@/lib/validations/performance-notes";

function parsePerformanceNoteInput(input: unknown): PerformanceNoteInput {
  const parsed = performanceNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(
      parsed.error.issues[0]?.message ?? "Please check the performance note form.",
    );
  }

  return parsed.data;
}

async function ensureStaffExists(staffId: string) {
  const staff = await db.staff.findUnique({
    where: { id: staffId },
    select: { id: true },
  });

  if (!staff) {
    throw new ServiceError("Choose a valid staff member.");
  }
}

export async function listPerformanceNotes() {
  return db.performanceNote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getPerformanceNoteById(id: string) {
  return db.performanceNote.findUnique({
    where: { id },
  });
}

export async function createPerformanceNote(input: unknown) {
  const data = parsePerformanceNoteInput(input);
  await ensureStaffExists(data.staffId);

  return db.performanceNote.create({
    data,
    include: { staff: { select: { name: true } } },
  });
}

export async function updatePerformanceNote(id: string, input: unknown) {
  const data = parsePerformanceNoteInput(input);
  await ensureStaffExists(data.staffId);

  return db.performanceNote.update({
    where: { id },
    data,
    include: { staff: { select: { name: true } } },
  });
}

export async function deletePerformanceNote(id: string) {
  return db.performanceNote.delete({
    where: { id },
    include: { staff: { select: { name: true } } },
  });
}
