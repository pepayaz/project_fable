import { getAiConfig } from "@/lib/ai/config";
import { createGeminiProvider } from "@/lib/ai/gemini";
import type { AiProvider } from "@/lib/ai/provider";

export function getAiProvider(): AiProvider | null {
  const config = getAiConfig();

  if (config.provider === "gemini") {
    if (!config.apiKey) {
      return null;
    }

    return createGeminiProvider(config.apiKey, config.model);
  }

  return null;
}
