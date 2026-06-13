import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterSelect, FilterText } from "@/components/ui/FilterBar";
import { requirePermission } from "@/lib/auth/guards";
import { listAuditLogs } from "@/lib/services/audit-log";
import {
  auditActions,
  auditActorRoles,
  auditEntityTypes,
  auditLogListParamsSchema,
} from "@/lib/validations/list-filters";

type AuditLogsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function actionBadgeClass(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-success-soft text-success";
    case "UPDATE":
      return "bg-info-soft text-info";
    case "DELETE":
      return "bg-danger-soft text-danger";
    case "RESTORE":
      return "bg-primary-soft text-primary";
    default:
      return "bg-surface-muted text-text-muted";
  }
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function FilterDate({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium text-text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        defaultValue={defaultValue}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
      />
    </div>
  );
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  await requirePermission("auditLogs:read");
  const raw = searchParams ? await searchParams : {};
  const filters = auditLogListParamsSchema.parse(raw);
  const logs = await listAuditLogs(filters);
  const hasFilters = Boolean(
    filters.q ||
      filters.action ||
      filters.entityType ||
      filters.actorRole ||
      filters.from ||
      filters.to,
  );

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="A simple record of who changed what across the workspace."
      />
      <FilterBar basePath="/audit-logs">
        <FilterText
          name="q"
          label="Search"
          defaultValue={filters.q}
          placeholder="Summary, actor, or entity ID"
        />
        <FilterSelect name="action" label="Action" defaultValue={filters.action ?? ""}>
          <option value="">All</option>
          {auditActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="entityType" label="Entity" defaultValue={filters.entityType ?? ""}>
          <option value="">All</option>
          {auditEntityTypes.map((entityType) => (
            <option key={entityType} value={entityType}>
              {entityType}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="actorRole" label="Role" defaultValue={filters.actorRole ?? ""}>
          <option value="">All</option>
          {auditActorRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </FilterSelect>
        <FilterDate name="from" label="From" defaultValue={filters.from} />
        <FilterDate name="to" label="To" defaultValue={filters.to} />
        <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
          <option value="createdAt">Created time</option>
        </FilterSelect>
        <FilterSelect name="dir" label="Direction" defaultValue={filters.dir}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </FilterSelect>
      </FilterBar>
      {logs.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching audit logs" : "No audit activity yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Create, update, delete, restore, or generate records and they will show up here."
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-text-muted">Showing up to 200 audit logs.</p>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-muted">
                    <td className="px-4 py-4 whitespace-nowrap text-text-secondary">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-medium text-text-primary">{log.actorName}</td>
                    <td className="px-4 py-4 text-text-secondary">{log.actorRole}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${actionBadgeClass(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">{log.entityType}</td>
                    <td className="px-4 py-4 text-text-secondary">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
