import { db } from "@/lib/db";
import { getStaffDetailById } from "@/lib/services/staff";

type StaffDetail = NonNullable<Awaited<ReturnType<typeof getStaffDetailById>>>;

const CLOSED_TASK_STATUSES = ["DONE", "CANCELLED"];
const ATTENDANCE_ISSUE_STATUSES = ["ABSENT", "LATE", "SICK"];
const NOTE_CATEGORIES = ["POSITIVE", "IMPROVEMENT", "WARNING", "GENERAL"];

export async function getStaffAuditEvents(staffId: string) {
  return db.auditLog.findMany({
    where: { entityType: "Staff", entityId: staffId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      action: true,
      summary: true,
      actorName: true,
      createdAt: true,
    },
  });
}

type StaffAuditEvent = Awaited<ReturnType<typeof getStaffAuditEvents>>[number];

export type StaffSnapshot = {
  openTasks: number;
  overdueTasks: number;
  attendanceIssues: number;
  availabilityCount: number;
  totalNotes: number;
  notesByCategory: { category: string; count: number }[];
  signal: "Needs attention" | "Follow-up suggested" | "No immediate signals";
  reasons: string[];
};

export type TimelineEvent = {
  id: string;
  type: "task" | "attendance" | "availability" | "note" | "audit";
  at: Date;
  title: string;
  subtitle?: string;
  badge?: string;
};

export type StaffSignalLevel = "attention" | "follow_up" | "stable";

export type StaffSignalMetrics = {
  openTasks: number;
  overdueTasks: number;
  attendanceIssues: number;
  warningNotes: number;
  improvementNotes: number;
  availabilityCount: number;
};

export const HIGH_OPEN_TASK_LOAD = 5;
export const REPEATED_ATTENDANCE_ISSUES = 3;

const SNAPSHOT_SIGNAL_LABEL: Record<StaffSignalLevel, StaffSnapshot["signal"]> = {
  attention: "Needs attention",
  follow_up: "Follow-up suggested",
  stable: "No immediate signals",
};

function plural(count: number, word: string) {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

export function evaluateStaffSignals(metrics: StaffSignalMetrics): {
  level: StaffSignalLevel;
  reasons: string[];
} {
  const {
    openTasks,
    overdueTasks,
    attendanceIssues,
    warningNotes,
    improvementNotes,
    availabilityCount,
  } = metrics;

  const reasons: string[] = [];
  if (overdueTasks > 0) reasons.push(plural(overdueTasks, "overdue task"));
  if (warningNotes > 0) reasons.push(plural(warningNotes, "warning note"));
  if (attendanceIssues > 0) reasons.push(plural(attendanceIssues, "attendance issue"));
  if (openTasks >= HIGH_OPEN_TASK_LOAD) reasons.push(`${openTasks} open tasks (high load)`);
  else if (openTasks > 0) reasons.push(plural(openTasks, "open task"));
  if (improvementNotes > 0) reasons.push(plural(improvementNotes, "improvement note"));
  if (availabilityCount === 0) reasons.push("no availability records");

  let level: StaffSignalLevel;
  if (
    overdueTasks > 0 ||
    warningNotes > 0 ||
    attendanceIssues >= REPEATED_ATTENDANCE_ISSUES ||
    openTasks >= HIGH_OPEN_TASK_LOAD
  ) {
    level = "attention";
  } else if (
    openTasks > 0 ||
    improvementNotes > 0 ||
    attendanceIssues > 0 ||
    availabilityCount === 0
  ) {
    level = "follow_up";
  } else {
    level = "stable";
  }

  return { level, reasons };
}

export function buildStaffSnapshot(staff: StaffDetail): StaffSnapshot {
  const now = new Date();

  const openTasks = staff.tasks.filter(
    (task) => !CLOSED_TASK_STATUSES.includes(task.status),
  ).length;
  const overdueTasks = staff.tasks.filter(
    (task) =>
      !CLOSED_TASK_STATUSES.includes(task.status) && task.deadline !== null && task.deadline < now,
  ).length;
  const attendanceIssues = staff.attendances.filter((record) =>
    ATTENDANCE_ISSUE_STATUSES.includes(record.status),
  ).length;
  const availabilityCount = staff.availabilities.length;

  const counts = Object.fromEntries(NOTE_CATEGORIES.map((category) => [category, 0]));
  for (const note of staff.performanceNotes) {
    counts[note.category] = (counts[note.category] ?? 0) + 1;
  }
  const notesByCategory = NOTE_CATEGORIES.map((category) => ({
    category,
    count: counts[category] ?? 0,
  }));

  const { level, reasons } = evaluateStaffSignals({
    openTasks,
    overdueTasks,
    attendanceIssues,
    warningNotes: counts.WARNING ?? 0,
    improvementNotes: counts.IMPROVEMENT ?? 0,
    availabilityCount,
  });

  return {
    openTasks,
    overdueTasks,
    attendanceIssues,
    availabilityCount,
    totalNotes: staff.performanceNotes.length,
    notesByCategory,
    signal: SNAPSHOT_SIGNAL_LABEL[level],
    reasons,
  };
}

export function buildStaffTimeline(
  staff: StaffDetail,
  auditEvents: StaffAuditEvent[] = [],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const task of staff.tasks) {
    events.push({
      id: `task-${task.id}`,
      type: "task",
      at: task.createdAt,
      title: `Task: ${task.title}`,
      subtitle: `Priority ${task.priority}`,
      badge: task.status,
    });
  }

  for (const record of staff.attendances) {
    events.push({
      id: `attendance-${record.id}`,
      type: "attendance",
      at: record.date,
      title: `Attendance: ${record.eventName}`,
      badge: record.status,
    });
  }

  for (const slot of staff.availabilities) {
    events.push({
      id: `availability-${slot.id}`,
      type: "availability",
      at: slot.createdAt,
      title: `Availability: ${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`,
    });
  }

  for (const note of staff.performanceNotes) {
    events.push({
      id: `note-${note.id}`,
      type: "note",
      at: note.createdAt,
      title: "Performance note",
      badge: note.category,
    });
  }

  for (const log of auditEvents) {
    events.push({
      id: `audit-${log.id}`,
      type: "audit",
      at: log.createdAt,
      title: log.summary,
      subtitle: log.actorName,
      badge: log.action,
    });
  }

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 20);
}

