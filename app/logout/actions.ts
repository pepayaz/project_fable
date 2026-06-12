"use server";

import { redirect } from "next/navigation";
import { clearCurrentSession } from "@/lib/auth/session";

export async function logoutAction() {
  await clearCurrentSession();
  redirect("/login");
}
