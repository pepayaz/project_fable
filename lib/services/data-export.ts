import { db } from "@/lib/db";
import { buildCsv } from "@/lib/csv";
import { ServiceError } from "@/lib/services/errors";
import type { ExportEntity } from "@/lib/validations/data-tools";

function formatDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function formatDateTime(date: Date) {
  return date.toISOString();
}

export function exportFileName(entity: ExportEntity) {
  return `project-fable-${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
}

export function exportLabel(entity: ExportEntity) {
  switch (entity) {
    case "performance-notes":
      return "Performance Notes";
    case "departments":
      return "Departments";
    default:
      return entity[0].toUpperCase() + entity.slice(1);
  }
}

export async function buildExportCsv(entity: ExportEntity, actorRole: string) {
  switch (entity) {
    case "staff": {
      const headers = ["name", "email", "phone", "position", "status", "batch", "departmentName", "createdAt"];
      const rows = await db.staff.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
        include: { department: { select: { name: true } } },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          name: row.name,
          email: row.email,
          phone: row.phone,
          position: row.position,
          status: row.status,
          batch: row.batch,
          departmentName: row.department?.name,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
    case "departments": {
      const headers = ["name", "description", "createdAt"];
      const rows = await db.department.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          name: row.name,
          description: row.description,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
    case "tasks": {
      const headers = [
        "title",
        "description",
        "status",
        "priority",
        "deadline",
        "assignedStaffName",
        "assignedStaffEmail",
        "departmentName",
        "createdAt",
      ];
      const rows = await db.task.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          assignedToStaff: { select: { name: true, email: true } },
          department: { select: { name: true } },
        },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          deadline: formatDate(row.deadline),
          assignedStaffName: row.assignedToStaff?.name,
          assignedStaffEmail: row.assignedToStaff?.email,
          departmentName: row.department?.name,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
    case "attendance": {
      const headers = ["staffName", "staffEmail", "eventName", "date", "status", "notes", "createdAt"];
      const rows = await db.attendance.findMany({
        where: { deletedAt: null },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: { staff: { select: { name: true, email: true } } },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          staffName: row.staff.name,
          staffEmail: row.staff.email,
          eventName: row.eventName,
          date: formatDate(row.date),
          status: row.status,
          notes: row.notes,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
    case "availability": {
      const headers = ["staffName", "staffEmail", "dayOfWeek", "startTime", "endTime", "notes", "createdAt"];
      const rows = await db.availability.findMany({
        where: { deletedAt: null },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: { staff: { select: { name: true, email: true } } },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          staffName: row.staff.name,
          staffEmail: row.staff.email,
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
          notes: row.notes,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
    case "performance-notes": {
      if (actorRole !== "ADMIN") {
        throw new ServiceError("Only ADMIN can export full performance notes.");
      }

      const headers = ["category", "staffName", "staffEmail", "note", "createdAt"];
      const rows = await db.performanceNote.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { staff: { select: { name: true, email: true } } },
      });
      return buildCsv(
        headers,
        rows.map((row) => ({
          category: row.category,
          staffName: row.staff.name,
          staffEmail: row.staff.email,
          note: row.note,
          createdAt: formatDateTime(row.createdAt),
        })),
      );
    }
  }
}

export function buildTemplateCsv(entity: "departments" | "staff" | "tasks") {
  switch (entity) {
    case "departments":
      return buildCsv(["name", "description"], []);
    case "staff":
      return buildCsv(
        ["name", "email", "phone", "position", "status", "batch", "departmentName", "notes"],
        [],
      );
    case "tasks":
      return buildCsv(
        [
          "title",
          "description",
          "status",
          "priority",
          "deadline",
          "assignedStaffEmail",
          "assignedStaffName",
          "departmentName",
        ],
        [],
      );
  }
}
