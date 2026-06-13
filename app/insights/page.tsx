import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import ChartCard from "@/components/ui/analytics/ChartCard";
import HorizontalBarList, { type BarTone } from "@/components/ui/analytics/HorizontalBarList";
import StatusDistribution from "@/components/ui/analytics/StatusDistribution";
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

function levelTone(level: StaffSignalLevel): BarTone {
  switch (level) {
    case "attention":
      return "warning";
    case "follow_up":
      return "info";
    default:
      return "success";
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
  const attentionItems = data.visualAnalytics.attentionLevels.map((item) => ({
    label: item.label,
    value: item.count,
    tone: levelTone(item.level),
  }));
  const availabilityItems = data.visualAnalytics.availabilityCoverage.map((item) => ({
    label: item.label,
    value: item.count,
    tone: item.label === "No availability" ? ("warning" as const) : ("success" as const),
  }));
  const hasMissingAvailability = orgSummary.staffNoAvailability > 0;
  const hasNoActiveStaff = orgSummary.activeStaff === 0;
  const availabilityDescription = hasNoActiveStaff
    ? "No active staff records are currently available."
    : hasMissingAvailability
      ? "Missing availability is an operational follow-up signal, not a positive coverage metric."
      : "Active staff currently have availability records.";

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

      <GroupHeading>Visual Signals</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Attention Levels" description="Rule-based staff signal distribution.">
          <StatusDistribution items={attentionItems} />
          <p className="mt-3 text-xs text-text-muted">
            Use this to scan overall staff signal levels; review the Staff Attention List below for details.
          </p>
        </ChartCard>
        <ChartCard
          title="Availability Coverage"
          description={availabilityDescription}
        >
          <StatusDistribution
            items={availabilityItems}
            emptyMessage="No active staff records yet. Add staff and availability to see coverage."
          />
          {hasMissingAvailability && (
            <p className="mt-3 text-xs text-warning">
              {orgSummary.staffNoAvailability} active staff member
              {orgSummary.staffNoAvailability === 1 ? "" : "s"} missing availability should be reviewed for planning coverage.
            </p>
          )}
        </ChartCard>
        <ChartCard title="Open vs Overdue Tasks" description="Current task pressure across the organization.">
          <HorizontalBarList
            items={data.visualAnalytics.taskPressure.map((item) => ({
              label: item.label,
              value: item.count,
              tone:
                item.label === "Overdue tasks"
                  ? "warning"
                  : item.label === "Blocked tasks"
                    ? "danger"
                    : item.label === "Unassigned open"
                      ? "muted"
                      : "info",
            }))}
            emptyMessage="No current task pressure. Open, overdue, or blocked work will appear here."
          />
          <p className="mt-3 text-xs text-text-muted">
            Compare open work with overdue and blocked items before assigning more tasks.
          </p>
        </ChartCard>
        <ChartCard title="Top Open Task Load" description="Staff with the most assigned open tasks.">
          <HorizontalBarList
            items={workload.topOpen.map((member) => ({
              label: member.name,
              value: member.openTasks,
              detail: `${member.openTasks} open`,
              href: `/staff/${member.id}`,
              tone: "info",
            }))}
            emptyMessage="No open tasks assigned. Assigned open tasks will appear here for workload review."
          />
          <p className="mt-3 text-xs text-text-muted">
            Higher bars indicate staff who may need workload balancing.
          </p>
        </ChartCard>
        <ChartCard title="Overdue by Staff" description="Where overdue work is concentrated.">
          <HorizontalBarList
            items={workload.overdueByStaff.map((member) => ({
              label: member.name,
              value: member.overdueTasks,
              detail: `${member.overdueTasks} overdue`,
              href: `/staff/${member.id}`,
              tone: "warning",
            }))}
            emptyMessage="No overdue tasks. Overdue work will appear here when deadlines pass."
          />
          <p className="mt-3 text-xs text-text-muted">
            Use this as a follow-up queue, then inspect each staff detail before taking action.
          </p>
        </ChartCard>
      </div>

      <GroupHeading>Staff Attention List</GroupHeading>
      <p className="mb-3 text-sm text-text-muted">
        Start here for actionable follow-up. The charts above show patterns; this list shows who needs review.
      </p>
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
        {attentionList.length === 0 ? (
          <p className="text-sm text-text-muted">
            {hasNoActiveStaff
              ? "No active staff records are currently available. Add staff before drawing team-level conclusions."
              : "All active staff are stable right now."}
          </p>
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
