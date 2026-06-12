import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterText, FilterSelect } from "@/components/ui/FilterBar";
import { deletePerformanceNoteAction } from "@/app/performance-notes/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listPerformanceNotes } from "@/lib/services/performance-notes";
import { listStaffOptions } from "@/lib/services/staff";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";
import {
  performanceNoteListParamsSchema,
  performanceNoteSortKeys,
} from "@/lib/validations/list-filters";

type PerformanceNotesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof performanceNoteSortKeys)[number], string> = {
  createdAt: "Created",
  updatedAt: "Updated",
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
  const user = await requirePermission("performanceNotes:read");
  const canCreate = can(user, "performanceNotes:create");
  const canUpdate = can(user, "performanceNotes:update");
  const canDelete = can(user, "performanceNotes:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = performanceNoteListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const [notes, staffOptions] = await Promise.all([
    listPerformanceNotes(filters),
    listStaffOptions(),
  ]);
  const hasFilters = Boolean(filters.q || filters.category || filters.staff);

  return (
    <div>
      <PageHeader
        title="Performance Notes"
        description="Keep simple, documented notes on staff performance."
        actions={
          canCreate ? (
          <Link
            href="/performance-notes/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Performance Note
          </Link>
          ) : null
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {(notes.length > 0 || hasFilters) && (
        <FilterBar basePath="/performance-notes">
          <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Note text" />
          <FilterSelect name="category" label="Category" defaultValue={filters.category ?? ""}>
            <option value="">All</option>
            {performanceNoteCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="staff" label="Staff" defaultValue={filters.staff}>
            <option value="">All</option>
            {staffOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {performanceNoteSortKeys.map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="dir" label="Direction" defaultValue={filters.dir}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </FilterSelect>
        </FilterBar>
      )}
      {notes.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching performance notes" : "No performance notes yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Document staff performance to make evaluations fairer."
          }
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
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/performance-notes/${performanceNote.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deletePerformanceNoteAction}>
                            <input type="hidden" name="id" value={performanceNote.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    )}
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
