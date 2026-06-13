const DEFAULT_PROVIDER = "gemini";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export type AiConfig = {
  provider: string;
  apiKey: string;
  model: string;
};

export function getAiConfig(): AiConfig {
  return {
    provider: (process.env.AI_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase(),
    apiKey: (process.env.GEMINI_API_KEY ?? "").trim(),
    model: (process.env.AI_MODEL || DEFAULT_MODEL).trim(),
  };
}

export function isAiConfigured(): boolean {
  const config = getAiConfig();

  if (config.provider === "gemini") {
    return config.apiKey.length > 0;
  }

  return false;
}
