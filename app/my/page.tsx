import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { updateMyTaskStatusAction } from "@/app/my/actions";
import { deleteMyAvailabilityAction } from "@/app/my/availability/actions";
import { requirePermission } from "@/lib/auth/guards";
import { getMyStaff, getMyWorkspace } from "@/lib/services/my-workspace";

type MyWorkspacePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

const MEMBER_TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

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

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value}</p>
    </div>
  );
}

export default async function MyWorkspacePage({ searchParams }: MyWorkspacePageProps) {
  const user = await requirePermission("my:read");
  const staff = await getMyStaff(user);
  const params = searchParams ? await searchParams : {};

  if (!staff) {
    return (
      <div>
        <PageHeader title="My Workspace" description="Your personal people operations space." />
        <EmptyState
          title={user.linkedStaffId ? "Staff profile unavailable" : "No linked staff profile"}
          description={
            user.linkedStaffId
              ? "Your linked staff profile is no longer available. Please contact an administrator."
              : "Your account is not linked to a staff profile yet. Please contact an administrator."
          }
        />
      </div>
    );
  }

  const workspace = await getMyWorkspace(staff.id);

  return (
    <div>
      <PageHeader
        title="My Workspace"
        description={[staff.position, staff.department?.name].filter(Boolean).join(" · ") || undefined}
      />
      {params.error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </div>
      )}

      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary">My Profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Field label="Name" value={staff.name} />
          <Field label="Email" value={staff.email ?? "No email"} />
          <Field label="Phone" value={staff.phone ?? "No phone"} />
          <Field label="Position" value={staff.position ?? "No position"} />
          <Field label="Status" value={staff.status} />
          <Field label="Department" value={staff.department?.name ?? "Unassigned"} />
          <Field label="Batch" value={staff.batch ?? "No batch"} />
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Section title="My Tasks">
          {workspace.tasks.length === 0 ? (
            <p className="text-sm text-text-muted">No tasks assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {workspace.tasks.map((task) => (
                <div key={task.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{task.title}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Deadline: {formatDate(task.deadline)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge className={taskStatusBadgeClass(task.status)}>{task.status}</Badge>
                      <Badge className={priorityBadgeClass(task.priority)}>{task.priority}</Badge>
                    </div>
                  </div>
                  <form action={updateMyTaskStatusAction} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="taskId" value={task.id} />
                    <select
                      name="status"
                      defaultValue={
                        MEMBER_TASK_STATUSES.includes(task.status) ? task.status : "IN_PROGRESS"
                      }
                      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-primary"
                    >
                      {MEMBER_TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    >
                      Update status
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="My Availability"
          action={
            <Link
              href="/my/availability/new"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
            >
              Add
            </Link>
          }
        >
          {workspace.availabilities.length === 0 ? (
            <p className="text-sm text-text-muted">No availability recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {workspace.availabilities.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{slot.dayOfWeek}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {slot.startTime}–{slot.endTime}
                      {slot.notes ? ` · ${slot.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/my/availability/${slot.id}/edit`}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    >
                      Edit
                    </Link>
                    <form action={deleteMyAvailabilityAction}>
                      <input type="hidden" name="id" value={slot.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-xs font-medium text-danger hover:border-danger"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="My Attendance">
          {workspace.attendances.length === 0 ? (
            <p className="text-sm text-text-muted">No attendance records yet.</p>
          ) : (
            <div className="space-y-3">
              {workspace.attendances.map((record) => (
                <div key={record.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{record.eventName}</p>
                      <p className="mt-1 text-xs text-text-muted">{formatDate(record.date)}</p>
                    </div>
                    <Badge className={attendanceBadgeClass(record.status)}>{record.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="My Performance Notes">
          <p className="text-sm text-text-muted">
            Summary only. Note details are managed by your administrator.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {workspace.performanceByCategory.map((entry) => (
              <Badge key={entry.category} className={categoryBadgeClass(entry.category)}>
                {entry.category} · {entry.count}
              </Badge>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
