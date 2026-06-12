import { z } from "zod";

export const userRoles = ["ADMIN", "MANAGER", "MEMBER"] as const;

export const loginInputSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
