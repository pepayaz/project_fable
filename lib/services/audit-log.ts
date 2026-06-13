import { db } from "@/lib/db";
import type { AuthUser } from "@/lib/auth/session";
import type { AuditLogListParams } from "@/lib/validations/list-filters";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "GENERATE"
  | "RESTORE"
  | "EXPORT"
  | "IMPORT";

export type AuditEntityType =
  | "Staff"
  | "Department"
  | "Task"
  | "Attendance"
  | "Availability"
  | "PerformanceNote"
  | "AiBrief"
  | "AiWriting"
  | "DataExport"
  | "DataImport"
  | "User";

type AuditActor = Pick<AuthUser, "id" | "name" | "role">;

type RecordAuditLogInput = {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  actor: AuditActor;
};

export async function recordAuditLog(input: RecordAuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary,
        actorId: input.actor.id,
        actorName: input.actor.name,
        actorRole: input.actor.role,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log", error);
  }
}

function parseDateStart(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseDateEnd(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function listAuditLogs(params?: AuditLogListParams) {
  const from = parseDateStart(params?.from ?? "");
  const to = parseDateEnd(params?.to ?? "");

  return db.auditLog.findMany({
    where: {
      ...(params?.q
        ? {
            OR: [
              { summary: { contains: params.q } },
              { actorName: { contains: params.q } },
              { entityId: { contains: params.q } },
            ],
          }
        : {}),
      ...(params?.action ? { action: params.action } : {}),
      ...(params?.entityType ? { entityType: params.entityType } : {}),
      ...(params?.actorRole ? { actorRole: params.actorRole } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    orderBy: { createdAt: params?.dir ?? "desc" },
    take: 200,
  });
}

export function summarizeStaff(staff: { name: string }) {
  return `Staff: ${staff.name}`;
}

export function summarizeDepartment(department: { name: string }) {
  return `Department: ${department.name}`;
}

export function summarizeTask(task: { title: string }) {
  return `Task: ${task.title}`;
}

export function summarizeAttendance(attendance: { eventName: string; status: string }) {
  return `Attendance: ${attendance.eventName} (${attendance.status})`;
}

export function summarizeAvailability(availability: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}) {
  return `Availability: ${availability.dayOfWeek} ${availability.startTime}–${availability.endTime}`;
}

export function summarizePerformanceNote(note: { category: string; staff: { name: string } }) {
  return `Performance note (${note.category}) for ${note.staff.name}`;
}
