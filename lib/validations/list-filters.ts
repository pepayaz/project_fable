import { z } from "zod";
import { staffStatuses } from "@/lib/validations/staff";
import { taskStatuses, taskPriorities } from "@/lib/validations/task";
import { attendanceStatuses } from "@/lib/validations/attendance";
import { daysOfWeek } from "@/lib/validations/availability";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";

const searchText = z.string().trim().max(100).catch("");
const relationId = z.string().trim().max(100).catch("");
const direction = z.enum(["asc", "desc"]);
const dateText = z.string().trim().max(20).catch("");

export const staffSortKeys = ["name", "createdAt", "updatedAt"] as const;
export const staffListParamsSchema = z.object({
  q: searchText,
  status: z.enum(staffStatuses).optional().catch(undefined),
  department: relationId,
  sort: z.enum(staffSortKeys).catch("name"),
  dir: direction.catch("asc"),
});
export type StaffListParams = z.infer<typeof staffListParamsSchema>;

export const departmentSortKeys = ["name", "createdAt", "updatedAt"] as const;
export const departmentListParamsSchema = z.object({
  q: searchText,
  sort: z.enum(departmentSortKeys).catch("name"),
  dir: direction.catch("asc"),
});
export type DepartmentListParams = z.infer<typeof departmentListParamsSchema>;

export const taskSortKeys = ["deadline", "priority", "createdAt", "updatedAt"] as const;
export const taskListParamsSchema = z.object({
  q: searchText,
  status: z.enum(taskStatuses).optional().catch(undefined),
  priority: z.enum(taskPriorities).optional().catch(undefined),
  staff: relationId,
  department: relationId,
  sort: z.enum(taskSortKeys).catch("deadline"),
  dir: direction.catch("asc"),
});
export type TaskListParams = z.infer<typeof taskListParamsSchema>;

export const attendanceSortKeys = ["date", "createdAt"] as const;
export const attendanceListParamsSchema = z.object({
  q: searchText,
  status: z.enum(attendanceStatuses).optional().catch(undefined),
  staff: relationId,
  sort: z.enum(attendanceSortKeys).catch("date"),
  dir: direction.catch("desc"),
});
export type AttendanceListParams = z.infer<typeof attendanceListParamsSchema>;

export const availabilitySortKeys = ["dayOfWeek", "startTime", "createdAt"] as const;
export const availabilityListParamsSchema = z.object({
  staff: relationId,
  day: z.enum(daysOfWeek).optional().catch(undefined),
  sort: z.enum(availabilitySortKeys).catch("dayOfWeek"),
  dir: direction.catch("asc"),
});
export type AvailabilityListParams = z.infer<typeof availabilityListParamsSchema>;

export const performanceNoteSortKeys = ["createdAt", "updatedAt"] as const;
export const performanceNoteListParamsSchema = z.object({
  q: searchText,
  category: z.enum(performanceNoteCategories).optional().catch(undefined),
  staff: relationId,
  sort: z.enum(performanceNoteSortKeys).catch("createdAt"),
  dir: direction.catch("desc"),
});
export type PerformanceNoteListParams = z.infer<typeof performanceNoteListParamsSchema>;

export const auditActions = ["CREATE", "UPDATE", "DELETE", "GENERATE", "RESTORE"] as const;
export const auditEntityTypes = [
  "Staff",
  "Department",
  "Task",
  "Attendance",
  "Availability",
  "PerformanceNote",
  "AiBrief",
  "AiWriting",
] as const;
export const auditActorRoles = ["ADMIN", "MANAGER", "MEMBER"] as const;
export const auditLogSortKeys = ["createdAt"] as const;
export const auditLogListParamsSchema = z.object({
  q: searchText,
  action: z.enum(auditActions).optional().catch(undefined),
  entityType: z.enum(auditEntityTypes).optional().catch(undefined),
  actorRole: z.enum(auditActorRoles).optional().catch(undefined),
  from: dateText,
  to: dateText,
  sort: z.enum(auditLogSortKeys).catch("createdAt"),
  dir: direction.catch("desc"),
});
export type AuditLogListParams = z.infer<typeof auditLogListParamsSchema>;

export const trashEntityTypes = [
  "Staff",
  "Department",
  "Task",
  "Attendance",
  "Availability",
  "PerformanceNote",
] as const;
export const trashListParamsSchema = z.object({
  q: searchText,
  entityType: z.enum(trashEntityTypes).optional().catch(undefined),
});
export type TrashListParams = z.infer<typeof trashListParamsSchema>;
export type TrashEntityType = (typeof trashEntityTypes)[number];
