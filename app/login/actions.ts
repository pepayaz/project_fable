"use server";

import { redirect } from "next/navigation";
import { createUserSession } from "@/lib/auth/session";
import { getDefaultRedirectForRole } from "@/lib/auth/permissions";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { authenticateUser } from "@/lib/services/users";
import { assertLoginAllowed, recordFailedLogin, resetLoginLimit } from "@/lib/auth/rate-limit";

function loginDataFromForm(formData: FormData) {
  return {
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

function redirectWithError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  let nextPath = "/dashboard";
  const loginData = loginDataFromForm(formData);
  const email = typeof loginData.email === "string" ? loginData.email : "";

  try {
    assertLoginAllowed(email);
    const user = await authenticateUser(loginData);
    await createUserSession(user.id);
    resetLoginLimit(email);
    nextPath = getDefaultRedirectForRole(user.role);
  } catch (error) {
    recordFailedLogin(email);
    redirectWithError(getServiceErrorMessage(error, "Invalid email or password."));
  }

  redirect(nextPath);
}
