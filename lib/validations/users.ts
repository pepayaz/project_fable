import { z } from "zod";
import { type Role } from "@/lib/auth/permissions";

export const userRoles = ["ADMIN", "MANAGER", "MEMBER"] as const satisfies readonly Role[];

const optionalStaffId = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().max(100).nullable());

export const createUserInputSchema = z.object({
  name: z.string().trim().min(1, "User name is required.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  role: z.enum(userRoles, { message: "Choose a valid role." }),
  temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters.").max(200),
  linkedStaffId: optionalStaffId,
});

export const updateUserRoleInputSchema = z.object({
  role: z.enum(userRoles, { message: "Choose a valid role." }),
});

export const linkUserInputSchema = z.object({
  linkedStaffId: optionalStaffId,
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
