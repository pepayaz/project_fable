import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { getAuditActivitySummary, getDashboardSummary } from "@/lib/services/dashboard";

function taskStatusBadgeClass(status: string) {
  switch (status) {
    case "DONE":
      return "bg-success-soft text-success";
    case "IN_PROGRESS":
      return "bg-info-soft text-info";
    case "BLOCKED":
      return "bg-warning-soft text-warning";
    case "CANCELLED":
      return "bg-surface-muted text-text-muted";
    default:
      return "bg-primary-soft text-primary";
  }
}

function priorityBadgeClass(priority: string) {
  switch (priority) {
    case "LOW":
      return "bg-surface-muted text-text-muted";
    case "HIGH":
      return "bg-warning-soft text-warning";
    case "URGENT":
      return "bg-danger-soft text-danger";
    default:
      return "bg-info-soft text-info";
  }
}

function staffStatusBadgeClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-success-soft text-success";
    case "PROBATION":
      return "bg-warning-soft text-warning";
    case "RESIGNED":
      return "bg-danger-soft text-danger";
    default:
      return "bg-surface-muted text-text-muted";
  }
}

function attendanceBadgeClass(status: string) {
  switch (status) {
    case "PRESENT":
      return "bg-success-soft text-success";
    case "ABSENT":
      return "bg-danger-soft text-danger";
    case "EXCUSED":
      return "bg-info-soft text-info";
    case "SICK":
      return "bg-warning-soft text-warning";
    default:
      return "bg-primary-soft text-primary";
  }
}

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

function formatDate(date: Date | null) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Breakdown({
  items,
}: {
  items: { label: string; count: number; className: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <Badge className={item.className}>{item.label}</Badge>
              <span className="text-sm font-medium text-text-primary">{item.count}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requirePermission("dashboard:read");
  const summary = await getDashboardSummary();
  const { metrics } = summary;
  const showAudit = can(user, "auditLogs:read");
  const audit = showAudit ? await getAuditActivitySummary() : null;

  return (
    <div>
      <PageHeader title="Dashboard" description="A management overview of your organization." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Staff" value={String(metrics.totalStaff)} />
        <MetricCard label="Active Staff" value={String(metrics.activeStaff)} />
        <MetricCard label="Departments" value={String(metrics.totalDepartments)} />
        <MetricCard label="Open Tasks" value={String(metrics.openTasks)} />
        <MetricCard label="Overdue Tasks" value={String(metrics.overdueTasks)} />
        <MetricCard label="Completion Rate" value={`${metrics.completionRate}%`} />
        <MetricCard label="Unassigned Open Tasks" value={String(metrics.unassignedOpenTasks)} />
        <MetricCard label="Performance Notes" value={String(metrics.performanceNotes)} />
      </div>

      <GroupHeading>Tasks</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Tasks by Status">
          <Breakdown
            items={summary.tasksByStatus.map((item) => ({
              ...item,
              className: taskStatusBadgeClass(item.label),
            }))}
          />
        </Section>
        <Section title="Tasks by Priority">
          <Breakdown
            items={summary.tasksByPriority.map((item) => ({
              ...item,
              className: priorityBadgeClass(item.label),
            }))}
          />
        </Section>
      </div>

      <GroupHeading>People</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Staff by Status">
          <Breakdown
            items={summary.staffByStatus.map((item) => ({
              ...item,
              className: staffStatusBadgeClass(item.label),
            }))}
          />
        </Section>
        <Section title="Staff by Department">
          {summary.staffByDepartment.length === 0 && summary.unassignedStaff === 0 ? (
            <p className="text-sm text-text-muted">No staff distribution yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.staffByDepartment.map((department) => (
                <div key={department.id} className="flex items-center justify-between gap-4">
                  <p className="text-sm text-text-secondary">{department.name}</p>
                  <p className="text-sm font-medium text-text-primary">{department._count.staff}</p>
                </div>
              ))}
              {summary.unassignedStaff > 0 && (
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                  <p className="text-sm text-text-secondary">Unassigned</p>
                  <p className="text-sm font-medium text-text-primary">{summary.unassignedStaff}</p>
                </div>
              )}
            </div>
          )}
        </Section>
        <Section title="Top Workload">
          {summary.topWorkload.length === 0 ? (
            <p className="text-sm text-text-muted">No open tasks assigned.</p>
          ) : (
            <div className="space-y-3">
              {summary.topWorkload.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4">
                  <p className="text-sm text-text-secondary">{member.name}</p>
                  <p className="text-sm font-medium text-text-primary">{member.openTasks} open</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <GroupHeading>Attendance &amp; Performance</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Attendance by Status">
          <Breakdown
            items={summary.attendanceByStatus.map((item) => ({
              ...item,
              className: attendanceBadgeClass(item.label),
            }))}
          />
        </Section>
        <Section title="Performance Notes by Category">
          <Breakdown
            items={summary.performanceByCategory.map((item) => ({
              ...item,
              className: categoryBadgeClass(item.label),
            }))}
          />
        </Section>
      </div>

      <GroupHeading>Recent Activity</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Recent Tasks">
          {summary.recentTasks.length === 0 ? (
            <p className="text-sm text-text-muted">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentTasks.map((task) => (
                <div key={task.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{task.title}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {task.assignedToStaff?.name ?? task.department?.name ?? "No assignee"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge className={taskStatusBadgeClass(task.status)}>{task.status}</Badge>
                      <Badge className={priorityBadgeClass(task.priority)}>{task.priority}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">Deadline: {formatDate(task.deadline)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent Attendance">
          {summary.recentAttendance.length === 0 ? (
            <p className="text-sm text-text-muted">No attendance records yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentAttendance.map((record) => (
                <div key={record.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{record.staff.name}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {record.eventName} - {formatDate(record.date)}
                      </p>
                    </div>
                    <Badge className={attendanceBadgeClass(record.status)}>{record.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent Performance Notes">
          {summary.recentPerformanceNotes.length === 0 ? (
            <p className="text-sm text-text-muted">No performance notes yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentPerformanceNotes.map((performanceNote) => (
                <div
                  key={performanceNote.id}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {performanceNote.staff.name}
                      </p>
                      <p className="mt-1 max-w-md truncate text-xs text-text-muted">
                        {performanceNote.note}
                      </p>
                    </div>
                    <Badge className={categoryBadgeClass(performanceNote.category)}>
                      {performanceNote.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {showAudit && audit && (
        <>
          <GroupHeading>Audit</GroupHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Recent Audit Logs">
              {audit.recentAuditLogs.length === 0 ? (
                <p className="text-sm text-text-muted">No audit activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {audit.recentAuditLogs.map((log) => (
                    <div key={log.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{log.summary}</p>
                          <p className="mt-1 text-xs text-text-muted">
                            {log.actorName} · {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                        <Badge className={actionBadgeClass(log.action)}>{log.action}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Activity by Action">
              <Breakdown
                items={audit.activityByAction.map((item) => ({
                  ...item,
                  className: actionBadgeClass(item.label),
                }))}
              />
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
