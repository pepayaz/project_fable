"use client";

import { useState, useTransition } from "react";
import { AI_DRAFT_DISCLAIMER, AI_SOURCE_DISCLAIMER } from "@/lib/ai/safety";
import type { AiResult } from "@/lib/ai/provider";

const TONES = ["Neutral", "Concise", "Supportive"];

type WritingActionInput = { tone: string; context: string; category?: string };

type AiWritingCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  configured: boolean;
  withTone?: boolean;
  withContext?: boolean;
  categories?: string[];
  action: (input: WritingActionInput) => Promise<AiResult>;
};

export default function AiWritingCard({
  title,
  description,
  buttonLabel,
  configured,
  withTone = false,
  withContext = false,
  categories,
  action,
}: AiWritingCardProps) {
  const [tone, setTone] = useState("Neutral");
  const [category, setCategory] = useState(categories?.[0] ?? "");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setCopied(false);
    startTransition(async () => {
      const next = await action({
        tone,
        context,
        category: categories ? category : undefined,
      });
      setResult(next);
    });
  }

  async function handleCopy() {
    if (result?.status === "ok") {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    }
  }

  const disabled = !configured || pending;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-xs text-text-muted">{description}</p>
      </div>

      {(withTone || categories || withContext) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {withTone && (
            <div>
              <label className="block text-xs font-medium text-text-muted">Tone</label>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                disabled={!configured}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                {TONES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          {categories && (
            <div>
              <label className="block text-xs font-medium text-text-muted">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={!configured}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          {withContext && (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-muted">
                Manager context (optional)
              </label>
              <textarea
                value={context}
                onChange={(event) => setContext(event.target.value)}
                disabled={!configured}
                maxLength={500}
                rows={2}
                placeholder="Optional focus or bullet points (not saved)."
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:border-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Generating…" : buttonLabel}
        </button>
      </div>

      {!configured && (
        <p className="mt-4 rounded-md border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
          AI is not configured. Set GEMINI_API_KEY to enable AI writing.
        </p>
      )}

      {configured && result?.status === "not_configured" && (
        <p className="mt-4 rounded-md border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
          AI is not configured. Set GEMINI_API_KEY to enable AI writing.
        </p>
      )}

      {result?.status === "error" && (
        <div className="mt-4 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {result.message}
        </div>
      )}

      {result?.status === "ok" && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              {AI_DRAFT_DISCLAIMER} {AI_SOURCE_DISCLAIMER}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <article className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-surface-muted px-5 py-4 font-sans text-sm leading-relaxed text-text-primary">
            {result.text}
          </article>
        </div>
      )}
    </section>
  );
}
