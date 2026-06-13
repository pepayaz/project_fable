import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { availabilityInputSchema, type AvailabilityInput } from "@/lib/validations/availability";
import type { AvailabilityListParams } from "@/lib/validations/list-filters";

function availabilityOrderBy(
  sort: AvailabilityListParams["sort"],
  dir: AvailabilityListParams["dir"],
) {
  switch (sort) {
    case "startTime":
      return { startTime: dir };
    case "createdAt":
      return { createdAt: dir };
    default:
      return [{ dayOfWeek: dir }, { startTime: "asc" as const }];
  }
}

function parseAvailabilityInput(input: unknown): AvailabilityInput {
  const parsed = availabilityInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the availability form.");
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

export async function listAvailabilityRecords(params?: AvailabilityListParams) {
  return db.availability.findMany({
    where: {
      deletedAt: null,
      ...(params?.staff ? { staffId: params.staff } : {}),
      ...(params?.day ? { dayOfWeek: params.day } : {}),
    },
    orderBy: availabilityOrderBy(params?.sort ?? "dayOfWeek", params?.dir ?? "asc"),
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

export async function getAvailabilityById(id: string) {
  return db.availability.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createAvailability(input: unknown) {
  const data = parseAvailabilityInput(input);
  await ensureStaffExists(data.staffId);

  return db.availability.create({ data });
}

async function ensureAvailabilityActive(id: string) {
  const existing = await db.availability.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("Availability record not found.");
  }
}

export async function updateAvailability(id: string, input: unknown) {
  const data = parseAvailabilityInput(input);
  await ensureAvailabilityActive(id);
  await ensureStaffExists(data.staffId);

  return db.availability.update({
    where: { id },
    data,
  });
}

export async function deleteAvailability(id: string) {
  await ensureAvailabilityActive(id);

  return db.availability.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

