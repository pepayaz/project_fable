import { db } from "@/lib/db";
import { staffStatuses } from "@/lib/validations/staff";
import { taskStatuses, taskPriorities } from "@/lib/validations/task";
import { attendanceStatuses } from "@/lib/validations/attendance";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";

const CLOSED_TASK_STATUSES = ["DONE", "CANCELLED"];
const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "GENERATE", "RESTORE"] as const;

function buildBreakdown(keys: readonly string[], rows: { _count: number }[], field: string) {
  const counts = Object.fromEntries(
    rows.map((row) => [(row as Record<string, unknown>)[field] as string, row._count]),
  );
  return keys.map((key) => ({ label: key, count: counts[key] ?? 0 }));
}

export async function getDashboardSummary() {
  const now = new Date();

  const [
    totalStaff,
    activeStaff,
    totalDepartments,
    openTasks,
    overdueTasks,
    completedTasks,
    blockedTasks,
    cancelledTasks,
    totalTasks,
    unassignedOpenTasks,
    attendanceRecords,
    availabilityRecords,
    performanceNotes,
    staffByStatusRows,
    tasksByStatusRows,
    tasksByPriorityRows,
    attendanceByStatusRows,
    performanceByCategoryRows,
    recentTasks,
    recentAttendance,
    recentPerformanceNotes,
    staffByDepartment,
    unassignedStaff,
    workloadStaff,
  ] = await Promise.all([
    db.staff.count({ where: { deletedAt: null } }),
    db.staff.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.department.count({ where: { deletedAt: null } }),
    db.task.count({ where: { status: { notIn: CLOSED_TASK_STATUSES }, deletedAt: null } }),
    db.task.count({
      where: {
        deadline: { lt: now },
        status: { notIn: CLOSED_TASK_STATUSES },
        deletedAt: null,
      },
    }),
    db.task.count({ where: { status: "DONE", deletedAt: null } }),
    db.task.count({ where: { status: "BLOCKED", deletedAt: null } }),
    db.task.count({ where: { status: "CANCELLED", deletedAt: null } }),
    db.task.count({ where: { deletedAt: null } }),
    db.task.count({
      where: {
        assignedToStaffId: null,
        status: { notIn: CLOSED_TASK_STATUSES },
        deletedAt: null,
      },
    }),
    db.attendance.count({ where: { deletedAt: null } }),
    db.availability.count({ where: { deletedAt: null } }),
    db.performanceNote.count({ where: { deletedAt: null } }),
    db.staff.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    db.task.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    db.task.groupBy({ by: ["priority"], where: { deletedAt: null }, _count: true }),
    db.attendance.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    db.performanceNote.groupBy({ by: ["category"], where: { deletedAt: null }, _count: true }),
    db.task.findMany({
      take: 5,
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        assignedToStaff: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.attendance.findMany({
      take: 5,
      where: { deletedAt: null },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.performanceNote.findMany({
      take: 5,
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { staff: { where: { deletedAt: null } } },
        },
      },
    }),
    db.staff.count({
      where: { departmentId: null, deletedAt: null },
    }),
    db.staff.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tasks: { where: { status: { notIn: CLOSED_TASK_STATUSES }, deletedAt: null } },
          },
        },
      },
    }),
  ]);

  const completionDenominator = totalTasks - cancelledTasks;
  const completionRate =
    completionDenominator > 0 ? Math.round((completedTasks / completionDenominator) * 100) : 0;

  const topWorkload = workloadStaff
    .map((member) => ({ id: member.id, name: member.name, openTasks: member._count.tasks }))
    .filter((member) => member.openTasks > 0)
    .sort((a, b) => b.openTasks - a.openTasks)
    .slice(0, 5);
  const staffByDepartmentBreakdown = [
    ...staffByDepartment.map((department) => ({
      label: department.name,
      count: department._count.staff,
    })),
    ...(unassignedStaff > 0 ? [{ label: "Unassigned", count: unassignedStaff }] : []),
  ].sort((a, b) => b.count - a.count);

  return {
    metrics: {
      totalStaff,
      activeStaff,
      totalDepartments,
      openTasks,
      overdueTasks,
      completedTasks,
      blockedTasks,
      cancelledTasks,
      totalTasks,
      completionRate,
      unassignedOpenTasks,
      attendanceRecords,
      availabilityRecords,
      performanceNotes,
    },
    staffByStatus: buildBreakdown(staffStatuses, staffByStatusRows, "status"),
    tasksByStatus: buildBreakdown(taskStatuses, tasksByStatusRows, "status"),
    tasksByPriority: buildBreakdown(taskPriorities, tasksByPriorityRows, "priority"),
    attendanceByStatus: buildBreakdown(attendanceStatuses, attendanceByStatusRows, "status"),
    performanceByCategory: buildBreakdown(
      performanceNoteCategories,
      performanceByCategoryRows,
      "category",
    ),
    topWorkload,
    staffByDepartmentBreakdown,
    recentTasks,
    recentAttendance,
    recentPerformanceNotes,
    staffByDepartment,
    unassignedStaff,
  };
}

export async function getAuditActivitySummary() {
  const [recentAuditLogs, activityRows] = await Promise.all([
    db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    db.auditLog.groupBy({ by: ["action"], _count: true }),
  ]);

  return {
    recentAuditLogs,
    activityByAction: buildBreakdown(AUDIT_ACTIONS, activityRows, "action"),
  };
}

