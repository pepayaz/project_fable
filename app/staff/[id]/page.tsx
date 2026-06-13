import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { getStaffDetailById } from "@/lib/services/staff";
import {
  buildStaffSnapshot,
  buildStaffTimeline,
  getStaffAuditEvents,
  type StaffSnapshot,
  type TimelineEvent,
} from "@/lib/services/staff-activity";
import { isAiConfigured } from "@/lib/ai/config";
import {
  generateAvailabilityReminderAction,
  generateFollowupDraftAction,
  generatePerformanceNoteDraftAction,
  generateStaffBriefAction,
} from "@/app/ai/actions";
import AiBriefCard from "@/components/ai/AiBriefCard";
import AiWritingCard from "@/components/ai/AiWritingCard";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";

type StaffDetailPageProps = {
  params: Promise<{ id: string }>;
};

function statusBadgeClass(status: string) {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
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

function signalBadgeClass(signal: StaffSnapshot["signal"]) {
  switch (signal) {
    case "Needs attention":
      return "bg-warning-soft text-warning";
    case "Follow-up suggested":
      return "bg-info-soft text-info";
    default:
      return "bg-success-soft text-success";
  }
}

function timelineBadgeClass(event: TimelineEvent) {
  switch (event.type) {
    case "task":
      return taskStatusBadgeClass(event.badge ?? "");
    case "attendance":
      return attendanceBadgeClass(event.badge ?? "");
    case "note":
      return categoryBadgeClass(event.badge ?? "");
    case "audit":
      return actionBadgeClass(event.badge ?? "");
    default:
      return "bg-surface-muted text-text-muted";
  }
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const user = await requirePermission("staff:read");
  const { id } = await params;
  const staff = await getStaffDetailById(id);

  if (!staff) {
    notFound();
  }

  const canUpdate = can(user, "staff:update");
  const canGenerateAi = can(user, "ai:generate");
  const auditEvents = can(user, "auditLogs:read") ? await getStaffAuditEvents(staff.id) : [];
  const snapshot = buildStaffSnapshot(staff);
  const timeline = buildStaffTimeline(staff, auditEvents);

  return (
    <div>
      <PageHeader
        title={staff.name}
        description={[staff.position, staff.department?.name].filter(Boolean).join(" · ") || undefined}
        actions={
          <div className="flex gap-2">
            <Link
              href="/staff"
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              Back to Staff
            </Link>
            {canUpdate && (
              <Link
                href={`/staff/${staff.id}/edit`}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Edit
              </Link>
            )}
          </div>
        }
      />

      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
          <Badge className={statusBadgeClass(staff.status)}>{staff.status}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Field label="Email" value={staff.email ?? "No email"} />
          <Field label="Phone" value={staff.phone ?? "No phone"} />
          <Field label="Position" value={staff.position ?? "No position"} />
          <Field label="Department" value={staff.department?.name ?? "Unassigned"} />
          <Field label="Batch" value={staff.batch ?? "No batch"} />
          <Field label="Created" value={formatDate(staff.createdAt)} />
          <Field label="Updated" value={formatDate(staff.updatedAt)} />
        </div>
        {staff.notes && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Notes</p>
            <p className="mt-1 text-sm text-text-secondary">{staff.notes}</p>
          </div>
        )}
      </section>

      <GroupHeading>Quick Insights</GroupHeading>
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Signals</h2>
          <Badge className={signalBadgeClass(snapshot.signal)}>{snapshot.signal}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatTile label="Open Tasks" value={snapshot.openTasks} />
          <StatTile label="Overdue" value={snapshot.overdueTasks} />
          <StatTile label="Attendance Issues" value={snapshot.attendanceIssues} />
          <StatTile label="Availability" value={snapshot.availabilityCount} />
          <StatTile label="Notes" value={snapshot.totalNotes} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {snapshot.notesByCategory
            .filter((entry) => entry.count > 0)
            .map((entry) => (
              <Badge key={entry.category} className={categoryBadgeClass(entry.category)}>
                {entry.category} · {entry.count}
              </Badge>
            ))}
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          {snapshot.reasons.length > 0
            ? `Signals based on: ${snapshot.reasons.join(", ")}.`
            : "No immediate signals from current activity."}
        </p>
      </section>

      {canGenerateAi && (
        <>
          <GroupHeading>AI Briefing</GroupHeading>
          <AiBriefCard
            title="Staff AI Brief"
            description="A neutral draft briefing generated from this staff member's Project Fable records."
            buttonLabel="Generate AI brief"
            configured={isAiConfigured()}
            action={generateStaffBriefAction.bind(null, staff.id)}
          />

          <GroupHeading>AI Writing Assistant</GroupHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <AiWritingCard
              title="Follow-up Message Draft"
              description="A short, supportive draft message for this staff member."
              buttonLabel="Generate draft"
              configured={isAiConfigured()}
              withTone
              withContext
              action={generateFollowupDraftAction.bind(null, staff.id)}
            />
            <AiWritingCard
              title="Performance Note Draft"
              description="A neutral draft note to review and save manually. Output is not saved automatically."
              buttonLabel="Generate draft"
              configured={isAiConfigured()}
              withTone
              withContext
              categories={[...performanceNoteCategories]}
              action={generatePerformanceNoteDraftAction.bind(null, staff.id)}
            />
            <AiWritingCard
              title="Availability Reminder Draft"
              description="A polite draft asking this staff member to update their availability."
              buttonLabel="Generate draft"
              configured={isAiConfigured()}
              withTone
              action={generateAvailabilityReminderAction.bind(null, staff.id)}
            />
          </div>
        </>
      )}

      <GroupHeading>Activity Timeline</GroupHeading>
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        {timeline.length === 0 ? (
          <p className="text-sm text-text-muted">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {timeline.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{event.title}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatDate(event.at)}
                    {event.subtitle ? ` · ${event.subtitle}` : ""}
                  </p>
                </div>
                {event.badge && (
                  <Badge className={timelineBadgeClass(event)}>{event.badge}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <GroupHeading>Details</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Assigned Tasks">
          {staff.tasks.length === 0 ? (
            <p className="text-sm text-text-muted">No assigned tasks.</p>
          ) : (
            <div className="space-y-3">
              {staff.tasks.map((task) => (
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
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Attendance">
          {staff.attendances.length === 0 ? (
            <p className="text-sm text-text-muted">No attendance records.</p>
          ) : (
            <div className="space-y-3">
              {staff.attendances.map((record) => (
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

        <Section title="Availability">
          {staff.availabilities.length === 0 ? (
            <p className="text-sm text-text-muted">No availability records.</p>
          ) : (
            <div className="space-y-3">
              {staff.availabilities.map((slot) => (
                <div key={slot.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-text-primary">{slot.dayOfWeek}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {slot.startTime}–{slot.endTime}
                    {slot.notes ? ` · ${slot.notes}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Performance Notes">
          {staff.performanceNotes.length === 0 ? (
            <p className="text-sm text-text-muted">No performance notes.</p>
          ) : (
            <div className="space-y-3">
              {staff.performanceNotes.map((note) => (
                <div key={note.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-text-secondary">{note.note}</p>
                    <Badge className={categoryBadgeClass(note.category)}>{note.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{formatDate(note.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
