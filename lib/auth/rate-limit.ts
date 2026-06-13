import { ServiceError } from "@/lib/services/errors";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type LoginAttempt = {
  failed: number;
  resetAt: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function keyForEmail(email: string) {
  return email.trim().toLowerCase() || "unknown";
}

function currentAttempt(key: string) {
  const now = Date.now();
  const existing = loginAttempts.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh = { failed: 0, resetAt: now + WINDOW_MS };
    loginAttempts.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function assertLoginAllowed(email: string) {
  const key = keyForEmail(email);
  const attempt = currentAttempt(key);

  if (attempt.failed >= MAX_FAILED_ATTEMPTS) {
    throw new ServiceError("Too many login attempts. Try again later.");
  }
}

export function recordFailedLogin(email: string) {
  const key = keyForEmail(email);
  const attempt = currentAttempt(key);
  attempt.failed += 1;
  loginAttempts.set(key, attempt);
}

export function resetLoginLimit(email: string) {
  loginAttempts.delete(keyForEmail(email));
}

export const LOGIN_RATE_LIMIT_DESCRIPTION = {
  maxFailedAttempts: MAX_FAILED_ATTEMPTS,
  windowMs: WINDOW_MS,
};
