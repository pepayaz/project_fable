import { db } from "@/lib/db";
import type { AuthUser } from "@/lib/auth/session";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "GENERATE";

export type AuditEntityType =
  | "Staff"
  | "Department"
  | "Task"
  | "Attendance"
  | "Availability"
  | "PerformanceNote"
  | "AiBrief"
  | "AiWriting";

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

export async function listAuditLogs() {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
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
