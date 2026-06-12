import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { deletePerformanceNoteAction } from "@/app/performance-notes/actions";
import { listPerformanceNotes } from "@/lib/services/performance-notes";

type PerformanceNotesPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

function categoryBadgeClass(category: string) {
  switch (category) {
    case "POSITIVE":
      return "bg-success-soft text-success";
    case "IMPROVEMENT":
      return "bg-info-soft text-info";
    case "WARNING":
      return "bg-warning-soft text-warning";
    default:
      return "bg-surface-muted text-text-muted";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function PerformanceNotesPage({ searchParams }: PerformanceNotesPageProps) {
  const notes = await listPerformanceNotes();
  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader
        title="Performance Notes"
        description="Keep simple, documented notes on staff performance."
        actions={
          <Link
            href="/performance-notes/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Performance Note
          </Link>
        }
      />
      {params.error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </div>
      )}
      {notes.length === 0 ? (
        <EmptyState
          title="No performance notes yet"
          description="Document staff performance to make evaluations fairer."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notes.map((performanceNote) => (
                <tr key={performanceNote.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4 font-medium text-text-primary">
                    {performanceNote.staff.name}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${categoryBadgeClass(
                        performanceNote.category,
                      )}`}
                    >
                      {performanceNote.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    <p className="max-w-md truncate">{performanceNote.note}</p>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {formatDate(performanceNote.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/performance-notes/${performanceNote.id}/edit`}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      <form action={deletePerformanceNoteAction}>
                        <input type="hidden" name="id" value={performanceNote.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
