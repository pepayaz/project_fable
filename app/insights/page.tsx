import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { getPeopleIntelligence } from "@/lib/services/people-intelligence";
import type { StaffSignalLevel } from "@/lib/services/staff-activity";
import { isAiConfigured } from "@/lib/ai/config";
import { generateAvailabilityReminderAction, generateWeeklyBriefAction } from "@/app/ai/actions";
import AiBriefCard from "@/components/ai/AiBriefCard";
import AiWritingCard from "@/components/ai/AiWritingCard";

function levelBadgeClass(level: StaffSignalLevel) {
  switch (level) {
    case "attention":
      return "bg-warning-soft text-warning";
    case "follow_up":
      return "bg-info-soft text-info";
    default:
      return "bg-success-soft text-success";
  }
}

function levelLabel(level: StaffSignalLevel) {
  switch (level) {
    case "attention":
      return "Needs attention";
    case "follow_up":
      return "Follow-up suggested";
    default:
      return "Stable";
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

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
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

function StatRow({ name, value, href }: { name: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0">
      {href ? (
        <Link href={href} className="text-sm text-text-secondary hover:text-primary">
          {name}
        </Link>
      ) : (
        <p className="text-sm text-text-secondary">{name}</p>
      )}
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default async function InsightsPage() {
  const user = await requirePermission("dashboard:read");
  const data = await getPeopleIntelligence();
  const { orgSummary, attentionList, workload, weeklyOps } = data;
  const canGenerateAi = can(user, "ai:generate");

  return (
    <div>
      <PageHeader
        title="People Intelligence"
        description="Rule-based signals to help you understand your team's condition."
      />

      {canGenerateAi && (
        <>
          <GroupHeading>AI Briefing</GroupHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <AiBriefCard
              title="Weekly People Ops AI Brief"
              description="A neutral draft summary generated from current People Intelligence records."
              buttonLabel="Generate weekly brief"
              configured={isAiConfigured()}
              action={generateWeeklyBriefAction}
            />
            <AiWritingCard
              title="Team Availability Reminder Draft"
              description="A polite draft asking the team to update their availability."
              buttonLabel="Generate draft"
              configured={isAiConfigured()}
              withTone
              action={generateAvailabilityReminderAction.bind(null, null)}
            />
          </div>
        </>
      )}

      <GroupHeading>Organization Summary</GroupHeading>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Active Staff" value={String(orgSummary.activeStaff)} />
        <MetricCard label="Open Tasks" value={String(orgSummary.openTasks)} />
        <MetricCard label="Overdue Tasks" value={String(orgSummary.overdueTasks)} />
        <MetricCard label="Blocked Tasks" value={String(orgSummary.blockedTasks)} />
        <MetricCard label="Attendance Issues" value={String(orgSummary.attendanceIssues)} />
        <MetricCard label="Warning Notes" value={String(orgSummary.warningNotes)} />
        <MetricCard label="Improvement Notes" value={String(orgSummary.improvementNotes)} />
        <MetricCard label="Unassigned Open" value={String(orgSummary.unassignedOpenTasks)} />
        <MetricCard label="No Availability" value={String(orgSummary.staffNoAvailability)} />
        <MetricCard label="No Open Task" value={String(orgSummary.staffNoOpenTask)} />
      </div>

      <GroupHeading>Staff Attention List</GroupHeading>
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        {attentionList.length === 0 ? (
          <p className="text-sm text-text-muted">All active staff are stable right now.</p>
        ) : (
          <div className="space-y-3">
            {attentionList.map((entry) => (
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
                  <p className="mt-1 text-xs text-text-muted">
                    {[entry.position, entry.department].filter(Boolean).join(" · ") || "No department"}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{entry.reasons.join(", ")}</p>
                </div>
                <Badge className={levelBadgeClass(entry.level)}>{levelLabel(entry.level)}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <GroupHeading>Workload Balance</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Most Open Tasks">
          {workload.topOpen.length === 0 ? (
            <p className="text-sm text-text-muted">No open tasks assigned.</p>
          ) : (
            <div className="space-y-2">
              {workload.topOpen.map((member) => (
                <StatRow
                  key={member.id}
                  name={member.name}
                  value={`${member.openTasks} open`}
                  href={`/staff/${member.id}`}
                />
              ))}
            </div>
          )}
        </Section>
        <Section title="Overdue by Staff">
          {workload.overdueByStaff.length === 0 ? (
            <p className="text-sm text-text-muted">No overdue tasks.</p>
          ) : (
            <div className="space-y-2">
              {workload.overdueByStaff.map((member) => (
                <StatRow
                  key={member.id}
                  name={member.name}
                  value={`${member.overdueTasks} overdue`}
                  href={`/staff/${member.id}`}
                />
              ))}
            </div>
          )}
        </Section>
      </div>
      <div className="mt-4">
        <Section title="Available Capacity">
          <p className="text-sm text-text-secondary">
            {workload.unassignedOpenTasks} unassigned open task
            {workload.unassignedOpenTasks === 1 ? "" : "s"} ·{" "}
            {workload.noOpenTask.length} active staff with no open task
          </p>
          {workload.noOpenTask.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {workload.noOpenTask.map((member) => (
                <Link
                  key={member.id}
                  href={`/staff/${member.id}`}
                  className="rounded-md border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary hover:text-primary"
                >
                  {member.name}
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>

      <GroupHeading>This Week (last {weeklyOps.windowDays} days)</GroupHeading>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard label="Completed Recently" value={String(weeklyOps.completedRecently)} />
        <MetricCard label="Currently Overdue" value={String(weeklyOps.currentlyOverdue)} />
        <MetricCard label="Attendance Issues" value={String(weeklyOps.attendanceIssuesRecently)} />
      </div>
      <div className="mt-4">
        <Section title="Recent Performance Notes by Category">
          <div className="flex flex-wrap gap-2">
            {weeklyOps.recentNotesByCategory.map((entry) => (
              <Badge key={entry.label} className={categoryBadgeClass(entry.label)}>
                {entry.label} · {entry.count}
              </Badge>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
