"use client";

import { useState, useTransition } from "react";
import { AI_DRAFT_DISCLAIMER, AI_SOURCE_DISCLAIMER } from "@/lib/ai/safety";
import type { AiResult } from "@/lib/ai/provider";

type AiBriefCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  configured: boolean;
  action: () => Promise<AiResult>;
};

export default function AiBriefCard({
  title,
  description,
  buttonLabel,
  configured,
  action,
}: AiBriefCardProps) {
  const [result, setResult] = useState<AiResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setCopied(false);
    startTransition(async () => {
      const next = await action();
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>
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
          AI is not configured. Set GEMINI_API_KEY to enable AI briefs.
        </p>
      )}

      {configured && result?.status === "not_configured" && (
        <p className="mt-4 rounded-md border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
          AI is not configured. Set GEMINI_API_KEY to enable AI briefs.
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
