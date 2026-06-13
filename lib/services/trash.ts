import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import type { TrashEntityType, TrashListParams } from "@/lib/validations/list-filters";

export type TrashRecord = {
  id: string;
  entityType: TrashEntityType;
  label: string;
  summary: string;
  related?: string;
  deletedAt: Date;
};

type RestoredRecord = {
  id: string;
  entityType: TrashEntityType;
  summary: string;
  revalidatePaths: string[];
};

const TRASH_LIMIT_PER_ENTITY = 50;

function matchesEntity(params: TrashListParams | undefined, entityType: TrashEntityType) {
  return !params?.entityType || params.entityType === entityType;
}

function deletedAtOrNow(date: Date | null) {
  return date ?? new Date(0);
}

function relationLabel(name: string | null | undefined, deletedAt?: Date | null) {
  if (!name) {
    return undefined;
  }

  return deletedAt ? `${name} (deleted)` : name;
}

export async function listTrashRecords(params?: TrashListParams) {
  const q = params?.q ?? "";
  const groups: Record<TrashEntityType, TrashRecord[]> = {
    Staff: [],
    Department: [],
    Task: [],
    Attendance: [],
    Availability: [],
    PerformanceNote: [],
  };

  const [
    staff,
    departments,
    tasks,
    attendance,
    availability,
    performanceNotes,
  ] = await Promise.all([
    matchesEntity(params, "Staff")
      ? db.staff.findMany({
          where: {
            deletedAt: { not: null },
            ...(q
              ? {
                  OR: [
                    { name: { contains: q } },
                    { email: { contains: q } },
                    { position: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          select: { id: true, name: true, email: true, position: true, deletedAt: true },
        })
      : [],
    matchesEntity(params, "Department")
      ? db.department.findMany({
          where: {
            deletedAt: { not: null },
            ...(q ? { name: { contains: q } } : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          select: { id: true, name: true, description: true, deletedAt: true },
        })
      : [],
    matchesEntity(params, "Task")
      ? db.task.findMany({
          where: {
            deletedAt: { not: null },
            ...(q
              ? {
                  OR: [
                    { title: { contains: q } },
                    { description: { contains: q } },
                    { status: { contains: q } },
                    { priority: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          include: {
            assignedToStaff: { select: { name: true, deletedAt: true } },
            department: { select: { name: true, deletedAt: true } },
          },
        })
      : [],
    matchesEntity(params, "Attendance")
      ? db.attendance.findMany({
          where: {
            deletedAt: { not: null },
            ...(q
              ? {
                  OR: [
                    { eventName: { contains: q } },
                    { status: { contains: q } },
                    { notes: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          include: { staff: { select: { name: true, deletedAt: true } } },
        })
      : [],
    matchesEntity(params, "Availability")
      ? db.availability.findMany({
          where: {
            deletedAt: { not: null },
            ...(q
              ? {
                  OR: [
                    { dayOfWeek: { contains: q } },
                    { startTime: { contains: q } },
                    { endTime: { contains: q } },
                    { notes: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          include: { staff: { select: { name: true, deletedAt: true } } },
        })
      : [],
    matchesEntity(params, "PerformanceNote")
      ? db.performanceNote.findMany({
          where: {
            deletedAt: { not: null },
            ...(q
              ? {
                  OR: [
                    { category: { contains: q } },
                    { note: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { deletedAt: "desc" },
          take: TRASH_LIMIT_PER_ENTITY,
          include: { staff: { select: { name: true, deletedAt: true } } },
        })
      : [],
  ]);

  groups.Staff = staff.map((record) => ({
    id: record.id,
    entityType: "Staff",
    label: record.name,
    summary: [record.position, record.email].filter(Boolean).join(" - ") || "Staff record",
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  groups.Department = departments.map((record) => ({
    id: record.id,
    entityType: "Department",
    label: record.name,
    summary: record.description || "Department record",
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  groups.Task = tasks.map((record) => ({
    id: record.id,
    entityType: "Task",
    label: record.title,
    summary: `${record.status} - ${record.priority}`,
    related:
      relationLabel(record.assignedToStaff?.name, record.assignedToStaff?.deletedAt) ??
      relationLabel(record.department?.name, record.department?.deletedAt),
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  groups.Attendance = attendance.map((record) => ({
    id: record.id,
    entityType: "Attendance",
    label: record.eventName,
    summary: record.status,
    related: relationLabel(record.staff.name, record.staff.deletedAt),
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  groups.Availability = availability.map((record) => ({
    id: record.id,
    entityType: "Availability",
    label: `${record.dayOfWeek} ${record.startTime}-${record.endTime}`,
    summary: record.notes || "Availability record",
    related: relationLabel(record.staff.name, record.staff.deletedAt),
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  groups.PerformanceNote = performanceNotes.map((record) => ({
    id: record.id,
    entityType: "PerformanceNote",
    label: `${record.category} note`,
    summary: record.note,
    related: relationLabel(record.staff.name, record.staff.deletedAt),
    deletedAt: deletedAtOrNow(record.deletedAt),
  }));

  return groups;
}

async function ensureActiveStaff(staffId: string, message: string) {
  const staff = await db.staff.findFirst({
    where: { id: staffId, deletedAt: null },
    select: { id: true },
  });

  if (!staff) {
    throw new ServiceError(message);
  }
}

async function ensureActiveDepartment(departmentId: string, message: string) {
  const department = await db.department.findFirst({
    where: { id: departmentId, deletedAt: null },
    select: { id: true },
  });

  if (!department) {
    throw new ServiceError(message);
  }
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function restoreTrashRecord(
  entityType: TrashEntityType,
  id: string,
): Promise<RestoredRecord> {
  switch (entityType) {
    case "Staff": {
      const record = await db.staff.findFirst({ where: { id, deletedAt: { not: null } } });
      if (!record) throw new ServiceError("Deleted staff record not found.");

      const restored = await db.staff.update({ where: { id }, data: { deletedAt: null } });
      return {
        id: restored.id,
        entityType,
        summary: `Restored Staff: ${restored.name}`,
        revalidatePaths: ["/trash", "/staff", `/staff/${restored.id}`],
      };
    }
    case "Department": {
      const record = await db.department.findFirst({ where: { id, deletedAt: { not: null } } });
      if (!record) throw new ServiceError("Deleted department record not found.");

      const conflict = await db.department.findFirst({
        where: { id: { not: id }, name: record.name, deletedAt: null },
        select: { id: true },
      });
      if (conflict) {
        throw new ServiceError("A department with this name already exists.");
      }

      try {
        const restored = await db.department.update({ where: { id }, data: { deletedAt: null } });
        return {
          id: restored.id,
          entityType,
          summary: `Restored Department: ${restored.name}`,
          revalidatePaths: ["/trash", "/departments"],
        };
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ServiceError("A department with this name already exists.");
        }
        throw error;
      }
    }
    case "Task": {
      const record = await db.task.findFirst({ where: { id, deletedAt: { not: null } } });
      if (!record) throw new ServiceError("Deleted task record not found.");
      if (record.assignedToStaffId) {
        await ensureActiveStaff(
          record.assignedToStaffId,
          "Restore the assigned staff member before restoring this task.",
        );
      }
      if (record.departmentId) {
        await ensureActiveDepartment(
          record.departmentId,
          "Restore the related department before restoring this task.",
        );
      }

      const restored = await db.task.update({ where: { id }, data: { deletedAt: null } });
      return {
        id: restored.id,
        entityType,
        summary: `Restored Task: ${restored.title}`,
        revalidatePaths: ["/trash", "/tasks"],
      };
    }
    case "Attendance": {
      const record = await db.attendance.findFirst({ where: { id, deletedAt: { not: null } } });
      if (!record) throw new ServiceError("Deleted attendance record not found.");
      await ensureActiveStaff(record.staffId, "Restore the staff member before restoring this attendance record.");

      const restored = await db.attendance.update({ where: { id }, data: { deletedAt: null } });
      return {
        id: restored.id,
        entityType,
        summary: `Restored Attendance: ${restored.eventName} (${restored.status})`,
        revalidatePaths: ["/trash", "/attendance"],
      };
    }
    case "Availability": {
      const record = await db.availability.findFirst({ where: { id, deletedAt: { not: null } } });
      if (!record) throw new ServiceError("Deleted availability record not found.");
      await ensureActiveStaff(record.staffId, "Restore the staff member before restoring this availability record.");

      const restored = await db.availability.update({ where: { id }, data: { deletedAt: null } });
      return {
        id: restored.id,
        entityType,
        summary: `Restored Availability: ${restored.dayOfWeek} ${restored.startTime}-${restored.endTime}`,
        revalidatePaths: ["/trash", "/availability"],
      };
    }
    case "PerformanceNote": {
      const record = await db.performanceNote.findFirst({
        where: { id, deletedAt: { not: null } },
        include: { staff: { select: { name: true } } },
      });
      if (!record) throw new ServiceError("Deleted performance note not found.");
      await ensureActiveStaff(record.staffId, "Restore the staff member before restoring this performance note.");

      const restored = await db.performanceNote.update({
        where: { id },
        data: { deletedAt: null },
        include: { staff: { select: { name: true } } },
      });
      return {
        id: restored.id,
        entityType,
        summary: `Restored Performance note (${restored.category}) for ${restored.staff.name}`,
        revalidatePaths: ["/trash", "/performance-notes"],
      };
    }
  }
}
