import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ServiceError } from "@/lib/services/errors";
import { loginInputSchema } from "@/lib/validations/auth";
import {
  createUserInputSchema,
  linkUserInputSchema,
  updateUserRoleInputSchema,
} from "@/lib/validations/users";

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

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function ensureUserExists(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true, linkedStaffId: true },
  });

  if (!user) {
    throw new ServiceError("User not found.");
  }

  return user;
}

async function ensureStaffCanLink(staffId: string, userId: string) {
  const staff = await db.staff.findFirst({
    where: { id: staffId, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!staff) {
    throw new ServiceError("Choose an active staff member.");
  }

  const linkedUser = await db.user.findFirst({
    where: { linkedStaffId: staffId, id: { not: userId } },
    select: { id: true },
  });

  if (linkedUser) {
    throw new ServiceError("This staff member is already linked to another user.");
  }

  return staff;
}

export async function listUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      linkedStaffId: true,
      createdAt: true,
      linkedStaff: {
        select: {
          id: true,
          name: true,
          deletedAt: true,
        },
      },
    },
  });
}

export async function createUser(input: unknown) {
  const parsed = createUserInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Please check the user form.");
  }

  const data = parsed.data;
  if (data.linkedStaffId) {
    await ensureStaffCanLink(data.linkedStaffId, "");
  }

  try {
    return await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        passwordHash: await hashPassword(data.temporaryPassword),
        linkedStaffId: data.linkedStaffId,
      },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ServiceError("A user with this email or staff link already exists.");
    }
    throw error;
  }
}

export async function updateUserRole(id: string, input: unknown, actorId: string) {
  const parsed = updateUserRoleInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(parsed.error.issues[0]?.message ?? "Choose a valid role.");
  }

  const user = await ensureUserExists(id);
  if (id === actorId && user.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    throw new ServiceError("You cannot remove your own ADMIN role.");
  }

  return db.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function revokeUserSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

export async function setUserActive(id: string, isActive: boolean, actorId: string) {
  await ensureUserExists(id);
  if (id === actorId && !isActive) {
    throw new ServiceError("You cannot deactivate your own account.");
  }

  const user = await db.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  if (!isActive) {
    await revokeUserSessions(id);
  }

  return user;
}

export async function linkUserToStaff(userId: string, input: unknown) {
  const parsed = linkUserInputSchema.safeParse(input);
  if (!parsed.success || !parsed.data.linkedStaffId) {
    throw new ServiceError("Choose an active staff member.");
  }

  await ensureUserExists(userId);
  const staff = await ensureStaffCanLink(parsed.data.linkedStaffId, userId);
  const user = await db.user.update({
    where: { id: userId },
    data: { linkedStaffId: staff.id },
    select: { id: true, name: true, email: true },
  });

  return { user, staff };
}

export async function unlinkUserFromStaff(userId: string) {
  await ensureUserExists(userId);
  return db.user.update({
    where: { id: userId },
    data: { linkedStaffId: null },
    select: { id: true, name: true, email: true },
  });
}
