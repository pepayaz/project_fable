import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { ServiceError } from "@/lib/services/errors";
import { loginInputSchema } from "@/lib/validations/auth";

const DUMMY_PASSWORD_HASH =
  "scrypt$16384$8$1$0000000000000000000000000000000000000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export async function authenticateUser(input: unknown) {
  const parsed = loginInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ServiceError("Invalid email or password.");
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  const passwordValid = await verifyPassword(
    parsed.data.password,
    user && user.isActive ? user.passwordHash : DUMMY_PASSWORD_HASH,
  );

  if (!user || !user.isActive || !passwordValid) {
    throw new ServiceError("Invalid email or password.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
