import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { ServiceError } from "@/lib/services/errors";
import { loginInputSchema } from "@/lib/validations/auth";

export async function authenticateUser(input: unknown) {
  const parsed = loginInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError("Invalid email or password.");
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new ServiceError("Invalid email or password.");
  }

  const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordValid) {
    throw new ServiceError("Invalid email or password.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
