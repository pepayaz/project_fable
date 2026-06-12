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
    db.staff.count(),
    db.staff.count({ where: { status: "ACTIVE" } }),
    db.department.count(),
    db.task.count({ where: { status: { notIn: CLOSED_TASK_STATUSES } } }),
    db.task.count({
      where: {
        deadline: { lt: now },
        status: { notIn: CLOSED_TASK_STATUSES },
      },
    }),
    db.attendance.count(),
    db.availability.count(),
    db.performanceNote.count(),
    db.task.findMany({
      take: 5,
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
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { staff: true },
        },
      },
    }),
    db.staff.count({
      where: { departmentId: null },
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
