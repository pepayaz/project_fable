import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { getDashboardSummary } from "@/lib/services/dashboard";

function statusBadgeClass(status: string) {
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
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
  const summary = await getDashboardSummary();
  const { metrics } = summary;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your organization."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Staff" value={String(metrics.totalStaff)} />
        <MetricCard label="Active Staff" value={String(metrics.activeStaff)} />
        <MetricCard label="Departments" value={String(metrics.totalDepartments)} />
        <MetricCard label="Open Tasks" value={String(metrics.openTasks)} />
        <MetricCard label="Overdue Tasks" value={String(metrics.overdueTasks)} />
        <MetricCard label="Attendance Records" value={String(metrics.attendanceRecords)} />
        <MetricCard label="Availability Records" value={String(metrics.availabilityRecords)} />
        <MetricCard label="Performance Notes" value={String(metrics.performanceNotes)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
                        {task.assignedToStaff?.name ??
                          task.department?.name ??
                          "No assignee"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge className={statusBadgeClass(task.status)}>{task.status}</Badge>
                      <Badge className={priorityBadgeClass(task.priority)}>{task.priority}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    Deadline: {formatDate(task.deadline)}
                  </p>
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

        <Section title="Staff by Department">
          {summary.staffByDepartment.length === 0 && summary.unassignedStaff === 0 ? (
            <p className="text-sm text-text-muted">No staff distribution yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.staffByDepartment.map((department) => (
                <div key={department.id} className="flex items-center justify-between gap-4">
                  <p className="text-sm text-text-secondary">{department.name}</p>
                  <p className="text-sm font-medium text-text-primary">
                    {department._count.staff}
                  </p>
                </div>
              ))}
              {summary.unassignedStaff > 0 && (
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                  <p className="text-sm text-text-secondary">Unassigned</p>
                  <p className="text-sm font-medium text-text-primary">
                    {summary.unassignedStaff}
                  </p>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
