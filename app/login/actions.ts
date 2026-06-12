"use server";

import { redirect } from "next/navigation";
import { createUserSession } from "@/lib/auth/session";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { authenticateUser } from "@/lib/services/users";

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
  try {
    const user = await authenticateUser(loginDataFromForm(formData));
    await createUserSession(user.id);
  } catch (error) {
    redirectWithError(getServiceErrorMessage(error, "Invalid email or password."));
  }

  redirect("/dashboard");
}
