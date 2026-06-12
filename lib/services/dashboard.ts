import { db } from "@/lib/db";

const CLOSED_TASK_STATUSES = ["DONE", "CANCELLED"];

export async function getDashboardSummary() {
  const now = new Date();

  const [
    totalStaff,
    activeStaff,
    totalDepartments,
    openTasks,
    overdueTasks,
    attendanceRecords,
    availabilityRecords,
    performanceNotes,
    recentTasks,
    recentAttendance,
    recentPerformanceNotes,
    staffByDepartment,
    unassignedStaff,
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
    db.attendance.count({ where: { deletedAt: null } }),
    db.availability.count({ where: { deletedAt: null } }),
    db.performanceNote.count({ where: { deletedAt: null } }),
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
  ]);

  return {
    metrics: {
      totalStaff,
      activeStaff,
      totalDepartments,
      openTasks,
      overdueTasks,
      attendanceRecords,
      availabilityRecords,
      performanceNotes,
    },
    recentTasks,
    recentAttendance,
    recentPerformanceNotes,
    staffByDepartment,
    unassignedStaff,
  };
}
