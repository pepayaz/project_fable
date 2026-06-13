import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import {
  performanceNoteInputSchema,
  type PerformanceNoteInput,
} from "@/lib/validations/performance-notes";
import type { PerformanceNoteListParams } from "@/lib/validations/list-filters";

function performanceNoteOrderBy(
  sort: PerformanceNoteListParams["sort"],
  dir: PerformanceNoteListParams["dir"],
) {
  switch (sort) {
    case "updatedAt":
      return { updatedAt: dir };
    default:
      return { createdAt: dir };
  }
}

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
  const staff = await db.staff.findFirst({
    where: { id: staffId, deletedAt: null },
    select: { id: true },
  });

  if (!staff) {
    throw new ServiceError("Choose a valid staff member.");
  }
}

export async function listPerformanceNotes(params?: PerformanceNoteListParams) {
  return db.performanceNote.findMany({
    where: {
      deletedAt: null,
      ...(params?.q ? { note: { contains: params.q , mode: "insensitive" } } : {}),
      ...(params?.category ? { category: params.category } : {}),
      ...(params?.staff ? { staffId: params.staff } : {}),
    },
    orderBy: performanceNoteOrderBy(params?.sort ?? "createdAt", params?.dir ?? "desc"),
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
  return db.performanceNote.findFirst({
    where: { id, deletedAt: null },
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

async function ensurePerformanceNoteActive(id: string) {
  const existing = await db.performanceNote.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Performance note not found.");
  }
}

export async function updatePerformanceNote(id: string, input: unknown) {
  const data = parsePerformanceNoteInput(input);
  await ensurePerformanceNoteActive(id);
  await ensureStaffExists(data.staffId);

  return db.performanceNote.update({
    where: { id },
    data,
    include: { staff: { select: { name: true } } },
  });
}

export async function deletePerformanceNote(id: string) {
  await ensurePerformanceNoteActive(id);

  return db.performanceNote.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: { staff: { select: { name: true } } },
  });
}

