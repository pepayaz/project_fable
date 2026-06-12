import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import { staffInputSchema, type StaffInput } from "@/lib/validations/staff";

function parseStaffInput(input: unknown): StaffInput {
  const parsed = staffInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the staff form.");
  }

  return parsed.data;
}

export async function listStaff() {
  return db.staff.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function listStaffOptions() {
  return db.staff.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getStaffById(id: string) {
  return db.staff.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function createStaff(input: unknown) {
  const data = parseStaffInput(input);

  return db.staff.create({
    data,
  });
}

export async function updateStaff(id: string, input: unknown) {
  const data = parseStaffInput(input);

  return db.staff.update({
    where: { id },
    data,
  });
}

export async function deleteStaff(id: string) {
  return db.staff.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
