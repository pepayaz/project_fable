import { db } from "@/lib/db";
import { departmentInputSchema, type DepartmentInput } from "@/lib/validations/department";
import { ServiceError } from "@/lib/services/errors";

function parseDepartmentInput(input: unknown): DepartmentInput {
  const parsed = departmentInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the department form.");
  }

  return parsed.data;
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function listDepartments() {
  return db.department.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { staff: { where: { deletedAt: null } } },
      },
    },
  });
}

export async function listDepartmentOptions() {
  return db.department.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getDepartmentById(id: string) {
  return db.department.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createDepartment(input: unknown) {
  const data = parseDepartmentInput(input);

  try {
    return await db.department.create({ data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ServiceError("A department with this name already exists.");
    }

    throw error;
  }
}

export async function updateDepartment(id: string, input: unknown) {
  const data = parseDepartmentInput(input);

  try {
    return await db.department.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ServiceError("A department with this name already exists.");
    }

    throw error;
  }
}

export async function deleteDepartment(id: string) {
  const staffCount = await db.staff.count({
    where: { departmentId: id, deletedAt: null },
  });

  if (staffCount > 0) {
    throw new ServiceError("Reassign or remove staff before deleting this department.");
  }

  return db.department.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
