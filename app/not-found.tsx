import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-text-primary">
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Not found</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-text-secondary">
          This page may have moved, or you may not have access to it from your current workspace.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
