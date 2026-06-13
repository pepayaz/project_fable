const DEFAULT_AI_PROVIDER = "gemini";
const DEFAULT_AI_MODEL = "gemini-2.5-flash-lite";
const LOCAL_QA_PASSWORD = "project-fable-local-rbac-password";
const MIN_ADMIN_PASSWORD_LENGTH = 12;

export type ServerEnv = {
  databaseUrl: string;
  aiProvider: "gemini";
  geminiApiKey: string;
  aiModel: string;
};

export type SeedAdminEnv = {
  name: string;
  email: string;
  password: string;
};

function readEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function assertDatabaseUrl(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const isPostgres =
    databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");

  if (!isPostgres) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL postgresql:// URL.",
    );
  }
}

function normalizeAiProvider(value: string): "gemini" {
  const provider = (value || DEFAULT_AI_PROVIDER).trim().toLowerCase();
  if (provider !== "gemini") {
    throw new Error("AI_PROVIDER must be gemini.");
  }
  return provider;
}

function isWeakSeedPassword(password: string) {
  const lowered = password.toLowerCase();
  return (
    password.length < MIN_ADMIN_PASSWORD_LENGTH ||
    lowered.includes("password") ||
    lowered.includes("change-this") ||
    password === LOCAL_QA_PASSWORD
  );
}

export function getServerEnv(): ServerEnv {
  const databaseUrl = readEnv("DATABASE_URL");
  assertDatabaseUrl(databaseUrl);

  return {
    databaseUrl,
    aiProvider: normalizeAiProvider(readEnv("AI_PROVIDER")),
    geminiApiKey: readEnv("GEMINI_API_KEY"),
    aiModel: readEnv("AI_MODEL") || DEFAULT_AI_MODEL,
  };
}

export function getSeedAdminEnv({ production }: { production: boolean }): SeedAdminEnv | null {
  const name = readEnv("SEED_ADMIN_NAME") || "Project Fable Admin";
  const email = readEnv("SEED_ADMIN_EMAIL");
  const password = readEnv("SEED_ADMIN_PASSWORD");

  if (!production && !password) {
    return {
      name,
      email: email || "admin@fable.local",
      password: LOCAL_QA_PASSWORD,
    };
  }

  if (!email && !password) {
    if (production) {
      throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required for production seed.");
    }
    return null;
  }

  if (!email || !email.includes("@")) {
    throw new Error("SEED_ADMIN_EMAIL must be a valid email address.");
  }

  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD is required when SEED_ADMIN_EMAIL is set.");
  }

  if (production && isWeakSeedPassword(password)) {
    throw new Error("SEED_ADMIN_PASSWORD is too weak for production seed.");
  }

  return { name, email: email.toLowerCase(), password };
}

export function validateProductionEnv() {
  getServerEnv();
  getSeedAdminEnv({ production: process.env.NODE_ENV === "production" });
}
