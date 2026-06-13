import { db } from "@/lib/db";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";
import { evaluateStaffSignals, type StaffSignalLevel } from "@/lib/services/staff-activity";

const CLOSED_TASK_STATUSES = ["DONE", "CANCELLED"];
const ATTENDANCE_ISSUE_STATUSES = ["ABSENT", "LATE", "SICK"];
const WEEKLY_WINDOW_DAYS = 7;

export type AttentionEntry = {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
  level: StaffSignalLevel;
  reasons: string[];
  openTasks: number;
  overdueTasks: number;
  attendanceIssues: number;
  warningNotes: number;
  availabilityCount: number;
};

const LEVEL_RANK: Record<StaffSignalLevel, number> = {
  attention: 0,
  follow_up: 1,
  stable: 2,
};

function buildCountMap(rows: { _count: number }[], key: string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const id = (row as Record<string, unknown>)[key];
    if (typeof id === "string") {
      map.set(id, row._count);
    }
  }
  return map;
}

function buildBreakdown(keys: readonly string[], rows: { _count: number }[], field: string) {
  const counts = Object.fromEntries(
    rows.map((row) => [(row as Record<string, unknown>)[field] as string, row._count]),
  );
  return keys.map((key) => ({ label: key, count: counts[key] ?? 0 }));
}

function severity(entry: AttentionEntry) {
  return entry.overdueTasks * 3 + entry.warningNotes * 2 + entry.attendanceIssues + entry.openTasks;
}

export async function getPeopleIntelligence() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WEEKLY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [
    totalStaff,
    activeStaff,
    openTasksTotal,
    overdueTasksTotal,
    blockedTasks,
    attendanceIssuesTotal,
    warningNotesTotal,
    improvementNotesTotal,
    unassignedOpenTasks,
    openByStaffRows,
    overdueByStaffRows,
    attendanceIssuesByStaffRows,
    warningByStaffRows,
    improvementByStaffRows,
    availabilityByStaffRows,
    completedRecently,
    attendanceIssuesRecently,
    recentNotesByCategoryRows,
  ] = await Promise.all([
    db.staff.count({ where: { deletedAt: null } }),
    db.staff.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        position: true,
        department: { select: { name: true } },
      },
    }),
    db.task.count({ where: { status: { notIn: CLOSED_TASK_STATUSES }, deletedAt: null } }),
    db.task.count({
      where: { deadline: { lt: now }, status: { notIn: CLOSED_TASK_STATUSES }, deletedAt: null },
    }),
    db.task.count({ where: { status: "BLOCKED", deletedAt: null } }),
    db.attendance.count({ where: { status: { in: ATTENDANCE_ISSUE_STATUSES }, deletedAt: null } }),
    db.performanceNote.count({ where: { category: "WARNING", deletedAt: null } }),
    db.performanceNote.count({ where: { category: "IMPROVEMENT", deletedAt: null } }),
    db.task.count({
      where: {
        assignedToStaffId: null,
        status: { notIn: CLOSED_TASK_STATUSES },
        deletedAt: null,
      },
    }),
    db.task.groupBy({
      by: ["assignedToStaffId"],
      where: {
        assignedToStaffId: { not: null },
        status: { notIn: CLOSED_TASK_STATUSES },
        deletedAt: null,
      },
      _count: true,
    }),
    db.task.groupBy({
      by: ["assignedToStaffId"],
      where: {
        assignedToStaffId: { not: null },
        deadline: { lt: now },
        status: { notIn: CLOSED_TASK_STATUSES },
        deletedAt: null,
      },
      _count: true,
    }),
    db.attendance.groupBy({
      by: ["staffId"],
      where: { status: { in: ATTENDANCE_ISSUE_STATUSES }, deletedAt: null },
      _count: true,
    }),
    db.performanceNote.groupBy({
      by: ["staffId"],
      where: { category: "WARNING", deletedAt: null },
      _count: true,
    }),
    db.performanceNote.groupBy({
      by: ["staffId"],
      where: { category: "IMPROVEMENT", deletedAt: null },
      _count: true,
    }),
    db.availability.groupBy({
      by: ["staffId"],
      where: { deletedAt: null },
      _count: true,
    }),
    db.task.count({
      where: { status: "DONE", updatedAt: { gte: windowStart }, deletedAt: null },
    }),
    db.attendance.count({
      where: {
        status: { in: ATTENDANCE_ISSUE_STATUSES },
        date: { gte: windowStart },
        deletedAt: null,
      },
    }),
    db.performanceNote.groupBy({
      by: ["category"],
      where: { createdAt: { gte: windowStart }, deletedAt: null },
      _count: true,
    }),
  ]);

  const openMap = buildCountMap(openByStaffRows, "assignedToStaffId");
  const overdueMap = buildCountMap(overdueByStaffRows, "assignedToStaffId");
  const attendanceMap = buildCountMap(attendanceIssuesByStaffRows, "staffId");
  const warningMap = buildCountMap(warningByStaffRows, "staffId");
  const improvementMap = buildCountMap(improvementByStaffRows, "staffId");
  const availabilityMap = buildCountMap(availabilityByStaffRows, "staffId");

  const evaluated: AttentionEntry[] = activeStaff.map((staff) => {
    const openTasks = openMap.get(staff.id) ?? 0;
    const overdueTasks = overdueMap.get(staff.id) ?? 0;
    const attendanceIssues = attendanceMap.get(staff.id) ?? 0;
    const warningNotes = warningMap.get(staff.id) ?? 0;
    const improvementNotes = improvementMap.get(staff.id) ?? 0;
    const availabilityCount = availabilityMap.get(staff.id) ?? 0;
    const { level, reasons } = evaluateStaffSignals({
      openTasks,
      overdueTasks,
      attendanceIssues,
      warningNotes,
      improvementNotes,
      availabilityCount,
    });

    return {
      id: staff.id,
      name: staff.name,
      position: staff.position,
      department: staff.department?.name ?? null,
      level,
      reasons,
      openTasks,
      overdueTasks,
      attendanceIssues,
      warningNotes,
      availabilityCount,
    };
  });

  const attentionList = evaluated
    .filter((entry) => entry.level !== "stable")
    .sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || severity(b) - severity(a));

  const attentionCounts = {
    attention: evaluated.filter((entry) => entry.level === "attention").length,
    followUp: evaluated.filter((entry) => entry.level === "follow_up").length,
    stable: evaluated.filter((entry) => entry.level === "stable").length,
  };

  const topOpen = evaluated
    .filter((entry) => entry.openTasks > 0)
    .sort((a, b) => b.openTasks - a.openTasks)
    .slice(0, 8)
    .map((entry) => ({ id: entry.id, name: entry.name, openTasks: entry.openTasks }));

  const overdueByStaff = evaluated
    .filter((entry) => entry.overdueTasks > 0)
    .sort((a, b) => b.overdueTasks - a.overdueTasks)
    .map((entry) => ({ id: entry.id, name: entry.name, overdueTasks: entry.overdueTasks }));

  const noOpenTask = evaluated
    .filter((entry) => entry.openTasks === 0)
    .map((entry) => ({ id: entry.id, name: entry.name }));
  const staffNoAvailability = evaluated.filter((entry) => entry.availabilityCount === 0).length;
  const staffNoOpenTask = noOpenTask.length;

  return {
    orgSummary: {
      totalStaff,
      activeStaff: activeStaff.length,
      openTasks: openTasksTotal,
      overdueTasks: overdueTasksTotal,
      blockedTasks,
      attendanceIssues: attendanceIssuesTotal,
      warningNotes: warningNotesTotal,
      improvementNotes: improvementNotesTotal,
      unassignedOpenTasks,
      staffNoAvailability,
      staffNoOpenTask,
    },
    attentionCounts,
    visualAnalytics: {
      attentionLevels: [
        { label: "Needs attention", count: attentionCounts.attention, level: "attention" as const },
        { label: "Follow-up", count: attentionCounts.followUp, level: "follow_up" as const },
        { label: "Stable", count: attentionCounts.stable, level: "stable" as const },
      ],
      availabilityCoverage: [
        { label: "With availability", count: Math.max(activeStaff.length - staffNoAvailability, 0) },
        { label: "No availability", count: staffNoAvailability },
      ],
      taskPressure: [
        { label: "Open tasks", count: openTasksTotal },
        { label: "Overdue tasks", count: overdueTasksTotal },
        { label: "Blocked tasks", count: blockedTasks },
        { label: "Unassigned open", count: unassignedOpenTasks },
      ],
    },
    attentionList,
    workload: {
      topOpen,
      overdueByStaff,
      noOpenTask,
      unassignedOpenTasks,
    },
    weeklyOps: {
      windowDays: WEEKLY_WINDOW_DAYS,
      completedRecently,
      currentlyOverdue: overdueTasksTotal,
      attendanceIssuesRecently,
      recentNotesByCategory: buildBreakdown(
        performanceNoteCategories,
        recentNotesByCategoryRows,
        "category",
      ),
    },
  };
}

