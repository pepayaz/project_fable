import { getServerEnv } from "@/lib/env";

const DEFAULT_PROVIDER = "gemini";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export type AiConfig = {
  provider: string;
  apiKey: string;
  model: string;
};

export function getAiConfig(): AiConfig {
  const env = getServerEnv();

  return {
    provider: env.aiProvider || DEFAULT_PROVIDER,
    apiKey: env.geminiApiKey,
    model: env.aiModel || DEFAULT_MODEL,
  };
}

export function isAiConfigured(): boolean {
  const config = getAiConfig();

  if (config.provider === "gemini") {
    return config.apiKey.length > 0;
  }

  return false;
}
