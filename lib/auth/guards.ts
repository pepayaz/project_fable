import { redirect } from "next/navigation";
import { can, type Permission } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export async function requirePermission(permission: Permission) {
  const user = await requireUser();

  if (!can(user, permission)) {
    redirect("/unauthorized");
  }

  return user;
}
