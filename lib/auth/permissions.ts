import type { AuthUser } from "@/lib/auth/session";

export const permissions = [
  "dashboard:read",
  "staff:read",
  "staff:create",
  "staff:update",
  "staff:delete",
  "departments:read",
  "departments:create",
  "departments:update",
  "departments:delete",
  "tasks:read",
  "tasks:create",
  "tasks:update",
  "tasks:delete",
  "attendance:read",
  "attendance:create",
  "attendance:update",
  "attendance:delete",
  "availability:read",
  "availability:create",
  "availability:update",
  "availability:delete",
  "performanceNotes:read",
  "performanceNotes:create",
  "performanceNotes:update",
  "performanceNotes:delete",
  "auditLogs:read",
  "settings:read",
] as const;

export type Permission = (typeof permissions)[number];
export type Role = "ADMIN" | "MANAGER" | "MEMBER";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [...permissions],
  MANAGER: [
    "dashboard:read",
    "staff:read",
    "staff:create",
    "staff:update",
    "staff:delete",
    "departments:read",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "attendance:read",
    "attendance:create",
    "attendance:update",
    "attendance:delete",
    "availability:read",
    "availability:create",
    "availability:update",
    "availability:delete",
    "performanceNotes:read",
    "performanceNotes:create",
    "performanceNotes:update",
    "performanceNotes:delete",
    "settings:read",
  ],
  MEMBER: ["settings:read"],
};

function isRole(role: string): role is Role {
  return role === "ADMIN" || role === "MANAGER" || role === "MEMBER";
}

export function can(user: Pick<AuthUser, "role"> | null, permission: Permission) {
  if (!user || !isRole(user.role)) {
    return false;
  }

  return rolePermissions[user.role].includes(permission);
}

export function getDefaultRedirectForRole(role: string) {
  if (role === "MEMBER") {
    return "/settings";
  }

  return "/dashboard";
}
