"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-text-primary">
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Application error</p>
        <h1 className="mt-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm text-text-secondary">
          The app could not complete this request. Try again, or return to the dashboard and retry the workflow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
