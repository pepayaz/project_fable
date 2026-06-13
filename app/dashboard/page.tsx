import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ChartCard from "@/components/ui/analytics/ChartCard";
import HorizontalBarList, { type BarTone } from "@/components/ui/analytics/HorizontalBarList";
import StatusDistribution from "@/components/ui/analytics/StatusDistribution";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { getAuditActivitySummary, getDashboardSummary } from "@/lib/services/dashboard";
import { getPeopleIntelligence } from "@/lib/services/people-intelligence";

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

function taskStatusTone(status: string): BarTone {
  switch (status) {
    case "DONE":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "BLOCKED":
      return "warning";
    case "CANCELLED":
      return "muted";
    default:
      return "primary";
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

function priorityTone(priority: string): BarTone {
  switch (priority) {
    case "LOW":
      return "muted";
    case "HIGH":
      return "warning";
    case "URGENT":
      return "danger";
    default:
      return "info";
  }
}

function staffStatusTone(status: string): BarTone {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PROBATION":
      return "warning";
    case "RESIGNED":
      return "danger";
    default:
      return "muted";
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

function attendanceTone(status: string): BarTone {
  switch (status) {
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "danger";
    case "EXCUSED":
      return "info";
    case "SICK":
    case "LATE":
      return "warning";
    default:
      return "primary";
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

function categoryTone(category: string): BarTone {
  switch (category) {
    case "POSITIVE":
      return "success";
    case "IMPROVEMENT":
      return "info";
    case "WARNING":
      return "warning";
    default:
      return "muted";
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
    case "RESTORE":
      return "bg-primary-soft text-primary";
    default:
      return "bg-surface-muted text-text-muted";
  }
}

function actionTone(action: string): BarTone {
  switch (action) {
    case "CREATE":
      return "success";
    case "UPDATE":
      return "info";
    case "DELETE":
      return "danger";
    case "RESTORE":
      return "primary";
    default:
      return "muted";
  }
}

function attentionLevelBadgeClass(level: string) {
  switch (level) {
    case "attention":
      return "bg-warning-soft text-warning";
    case "follow_up":
      return "bg-info-soft text-info";
    default:
      return "bg-success-soft text-success";
  }
}

function attentionLevelLabel(level: string) {
  switch (level) {
    case "attention":
      return "Needs attention";
    case "follow_up":
      return "Follow-up suggested";
    default:
      return "Stable";
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

export default async function DashboardPage() {
  const user = await requirePermission("dashboard:read");
  const [summary, people] = await Promise.all([getDashboardSummary(), getPeopleIntelligence()]);
  const { metrics } = summary;
  const showAudit = can(user, "auditLogs:read");
  const audit = showAudit ? await getAuditActivitySummary() : null;
  const topAttention = people.attentionList.slice(0, 3);
  const staffDepartmentItems = summary.staffByDepartmentBreakdown.map((item) => ({
    label: item.label,
    value: item.count,
    tone: item.label === "Unassigned" ? ("muted" as const) : ("primary" as const),
  }));

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

      <GroupHeading>Visual Overview</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tasks by Status" description="Current task mix across active records.">
          <StatusDistribution
            items={summary.tasksByStatus.map((item) => ({
              label: item.label,
              value: item.count,
              tone: taskStatusTone(item.label),
            }))}
            emptyMessage="No active task records yet. Create or assign tasks to see this breakdown."
          />
        </ChartCard>
        <ChartCard title="Tasks by Priority" description="Priority spread across all non-deleted tasks.">
          <HorizontalBarList
            items={summary.tasksByPriority.map((item) => ({
              label: item.label,
              value: item.count,
              tone: priorityTone(item.label),
            }))}
            emptyMessage="No active task records yet. Add task priorities to understand workload urgency."
          />
        </ChartCard>
        <ChartCard title="Staff by Status" description="Staff status distribution.">
          <StatusDistribution
            items={summary.staffByStatus.map((item) => ({
              label: item.label,
              value: item.count,
              tone: staffStatusTone(item.label),
            }))}
            emptyMessage="No staff records yet. Add staff to see organization status coverage."
          />
        </ChartCard>
        <ChartCard title="Staff by Department" description="Where staff are currently grouped.">
          <HorizontalBarList
            items={staffDepartmentItems}
            emptyMessage="No department distribution yet. Assign staff to departments to compare coverage."
          />
        </ChartCard>
        <ChartCard title="Attendance by Status" description="Attendance records by status.">
          <StatusDistribution
            items={summary.attendanceByStatus.map((item) => ({
              label: item.label,
              value: item.count,
              tone: attendanceTone(item.label),
            }))}
            emptyMessage="No attendance records yet. Add attendance records to see presence patterns."
          />
        </ChartCard>
        <ChartCard title="Performance Notes by Category" description="Note categories across records.">
          <StatusDistribution
            items={summary.performanceByCategory.map((item) => ({
              label: item.label,
              value: item.count,
              tone: categoryTone(item.label),
            }))}
            emptyMessage="No performance note categories recorded yet. Add notes to see category balance."
          />
        </ChartCard>
        <ChartCard title="Top Staff by Open Tasks" description="Assigned open task load by staff.">
          <HorizontalBarList
            items={summary.topWorkload.map((member) => ({
              label: member.name,
              value: member.openTasks,
              detail: `${member.openTasks} open`,
              href: `/staff/${member.id}`,
              tone: "info",
            }))}
            emptyMessage="No open tasks assigned. Assigned open tasks will appear here for workload review."
          />
        </ChartCard>
      </div>

      <GroupHeading>People Intelligence</GroupHeading>
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={attentionLevelBadgeClass("attention")}>
              {people.attentionCounts.attention} need attention
            </Badge>
            <Badge className={attentionLevelBadgeClass("follow_up")}>
              {people.attentionCounts.followUp} follow-up
            </Badge>
            <Badge className={attentionLevelBadgeClass("stable")}>
              {people.attentionCounts.stable} stable
            </Badge>
          </div>
          <Link href="/insights" className="text-sm font-medium text-primary hover:text-primary-hover">
            View People Intelligence →
          </Link>
        </div>
        {topAttention.length > 0 && (
          <div className="mt-4 space-y-3">
            {topAttention.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/staff/${entry.id}`}
                    className="text-sm font-medium text-text-primary hover:text-primary"
                  >
                    {entry.name}
                  </Link>
                  <p className="mt-1 text-xs text-text-secondary">{entry.reasons.join(", ")}</p>
                </div>
                <Badge className={attentionLevelBadgeClass(entry.level)}>
                  {attentionLevelLabel(entry.level)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

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
              <HorizontalBarList
                items={audit.activityByAction.map((item) => ({
                  label: item.label,
                  value: item.count,
                  tone: actionTone(item.label),
                }))}
              />
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
