import type { AiProvider, AiRequest, AiResult } from "@/lib/ai/provider";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 30000;

export function createGeminiProvider(apiKey: string, model: string): AiProvider {
  return {
    async generate(input: AiRequest): Promise<AiResult> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: input.system }] },
            contents: [{ role: "user", parts: [{ text: input.user }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: input.maxTokens ?? 1500,
            },
          }),
        });

        if (!response.ok) {
          return { status: "error", message: "The AI service could not generate a brief right now." };
        }

        const data = await response.json();

        if (data?.promptFeedback?.blockReason) {
          return { status: "error", message: "The AI service declined to generate this brief." };
        }

        const parts = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts)
          ? parts
              .map((part: { text?: string }) => part.text ?? "")
              .join("")
              .trim()
          : "";

        if (!text) {
          return { status: "error", message: "The AI service returned an empty brief." };
        }

        return { status: "ok", text };
      } catch {
        return { status: "error", message: "The AI service could not generate a brief right now." };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
