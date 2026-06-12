import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { availabilityInputSchema, type AvailabilityInput } from "@/lib/validations/availability";

function parseAvailabilityInput(input: unknown): AvailabilityInput {
  const parsed = availabilityInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the availability form.");
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

export async function listAvailabilityRecords() {
  return db.availability.findMany({
    orderBy: [{ staff: { name: "asc" } }, { dayOfWeek: "asc" }, { startTime: "asc" }],
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
  return db.availability.findUnique({
    where: { id },
  });
}

export async function createAvailability(input: unknown) {
  const data = parseAvailabilityInput(input);
  await ensureStaffExists(data.staffId);

  return db.availability.create({ data });
}

export async function updateAvailability(id: string, input: unknown) {
  const data = parseAvailabilityInput(input);
  await ensureStaffExists(data.staffId);

  return db.availability.update({
    where: { id },
    data,
  });
}

export async function deleteAvailability(id: string) {
  return db.availability.delete({
    where: { id },
  });
}
