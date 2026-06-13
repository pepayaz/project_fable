import type { Permission } from "@/lib/auth/permissions";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", permission: "dashboard:read" },
  { label: "Insights", href: "/insights", permission: "dashboard:read" },
  { label: "Staff", href: "/staff", permission: "staff:read" },
  { label: "Departments", href: "/departments", permission: "departments:read" },
  { label: "Tasks", href: "/tasks", permission: "tasks:read" },
  { label: "Attendance", href: "/attendance", permission: "attendance:read" },
  { label: "Availability", href: "/availability", permission: "availability:read" },
  {
    label: "Performance Notes",
    href: "/performance-notes",
    permission: "performanceNotes:read",
  },
  { label: "Audit Logs", href: "/audit-logs", permission: "auditLogs:read" },
  { label: "My Workspace", href: "/my", permission: "my:read" },
  { label: "Settings", href: "/settings", permission: "settings:read" },
] satisfies Array<{ label: string; href: string; permission: Permission }>;
