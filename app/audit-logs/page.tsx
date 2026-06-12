import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { requirePermission } from "@/lib/auth/guards";
import { listAuditLogs } from "@/lib/services/audit-log";

function actionBadgeClass(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-success-soft text-success";
    case "UPDATE":
      return "bg-info-soft text-info";
    case "DELETE":
      return "bg-danger-soft text-danger";
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

export default async function AuditLogsPage() {
  await requirePermission("auditLogs:read");
  const logs = await listAuditLogs();

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="A simple record of who changed what across the workspace."
      />
      {logs.length === 0 ? (
        <EmptyState
          title="No audit activity yet"
          description="Create, update, or delete records and they will show up here."
        />
      ) : (
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
      )}
    </div>
  );
}
