import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterSelect, FilterText } from "@/components/ui/FilterBar";
import PageHeader from "@/components/ui/PageHeader";
import { restoreTrashRecordAction } from "@/app/trash/actions";
import { requirePermission } from "@/lib/auth/guards";
import { listTrashRecords, type TrashRecord } from "@/lib/services/trash";
import { trashEntityTypes, trashListParamsSchema, type TrashEntityType } from "@/lib/validations/list-filters";

type TrashPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function entityLabel(entityType: TrashEntityType) {
  return entityType === "PerformanceNote" ? "Performance Notes" : entityType;
}

function buildReturnTo(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `/trash?${query}` : "/trash";
}

function TrashSection({
  entityType,
  records,
  returnTo,
}: {
  entityType: TrashEntityType;
  records: TrashRecord[];
  returnTo: string;
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-surface shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-text-primary">{entityLabel(entityType)}</h2>
        <p className="mt-1 text-xs text-text-muted">{records.length} deleted record(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Record</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Related</th>
              <th className="px-4 py-3 font-medium">Deleted At</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-surface-muted">
                <td className="px-4 py-4">
                  <p className="font-medium text-text-primary">{record.label}</p>
                  <p className="mt-1 max-w-sm truncate text-xs text-text-muted">{record.summary}</p>
                </td>
                <td className="px-4 py-4 text-text-secondary">{record.entityType}</td>
                <td className="px-4 py-4 text-text-secondary">{record.related ?? "None"}</td>
                <td className="px-4 py-4 whitespace-nowrap text-text-secondary">
                  {formatDateTime(record.deletedAt)}
                </td>
                <td className="px-4 py-4">
                  <form action={restoreTrashRecordAction} className="flex justify-end">
                    <input type="hidden" name="id" value={record.id} />
                    <input type="hidden" name="entityType" value={record.entityType} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button
                      type="submit"
                      className="rounded-md border border-primary-border bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary hover:border-primary"
                    >
                      Restore
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function TrashPage({ searchParams }: TrashPageProps) {
  await requirePermission("trash:read");
  const raw = searchParams ? await searchParams : {};
  const filters = trashListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const success = typeof raw.success === "string" ? raw.success : undefined;
  const groups = await listTrashRecords(filters);
  const hasFilters = Boolean(filters.q || filters.entityType);
  const total = trashEntityTypes.reduce((sum, entityType) => sum + groups[entityType].length, 0);
  const returnTo = buildReturnTo({ q: filters.q, entityType: filters.entityType });

  return (
    <div>
      <PageHeader
        title="Trash"
        description="Review and restore soft-deleted records. Permanent delete is intentionally not available yet."
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-md border border-success-soft bg-success-soft px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}
      <FilterBar basePath="/trash">
        <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Name, title, or summary" />
        <FilterSelect name="entityType" label="Entity" defaultValue={filters.entityType ?? ""}>
          <option value="">All</option>
          {trashEntityTypes.map((entityType) => (
            <option key={entityType} value={entityType}>
              {entityLabel(entityType)}
            </option>
          ))}
        </FilterSelect>
      </FilterBar>
      <div className="mb-5 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary shadow-card">
        Restore only changes the selected record. Related deleted parent records must be restored first.
        Permanent delete is planned for a future policy decision.
      </div>
      {total === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching deleted records" : "Trash is empty"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Soft-deleted records will appear here for ADMIN recovery."
          }
        />
      ) : (
        <div className="space-y-5">
          {trashEntityTypes.map((entityType) => (
            <TrashSection
              key={entityType}
              entityType={entityType}
              records={groups[entityType]}
              returnTo={returnTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
