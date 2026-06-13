import { getStaffDetailById } from "@/lib/services/staff";
import { buildStaffSnapshot } from "@/lib/services/staff-activity";
import { getPeopleIntelligence } from "@/lib/services/people-intelligence";

type StaffDetail = NonNullable<Awaited<ReturnType<typeof getStaffDetailById>>>;

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => `${label}: ${count}`).join(", ") || "none";
}

function buildStaffBriefText(staff: StaffDetail) {
  const snapshot = buildStaffSnapshot(staff);
  const notesByCategory = snapshot.notesByCategory
    .map((entry) => `${entry.category}: ${entry.count}`)
    .join(", ");
  const availabilityDays = staff.availabilities.map((slot) => slot.dayOfWeek).join(", ") || "none";

  return [
    "Write a staff briefing for a manager using ONLY the records below.",
    "",
    "Records:",
    `- Name: ${staff.name}`,
    `- Position: ${staff.position ?? "Not set"}`,
    `- Department: ${staff.department?.name ?? "Unassigned"}`,
    `- Status: ${staff.status}`,
    `- Batch: ${staff.batch ?? "Not set"}`,
    `- Signal: ${snapshot.signal}`,
    `- Signal reasons: ${snapshot.reasons.length > 0 ? snapshot.reasons.join(", ") : "none"}`,
    `- Open tasks: ${snapshot.openTasks}`,
    `- Overdue tasks: ${snapshot.overdueTasks}`,
    `- Attendance issues: ${snapshot.attendanceIssues}`,
    `- Availability records: ${snapshot.availabilityCount}`,
    `- Tasks by status: ${countBy(staff.tasks, (task) => task.status)}`,
    `- Tasks by priority: ${countBy(staff.tasks, (task) => task.priority)}`,
    `- Attendance by status: ${countBy(staff.attendances, (record) => record.status)}`,
    `- Availability days: ${availabilityDays}`,
    `- Performance note category counts: ${notesByCategory}`,
    "",
    "Rules: plain text only, no markdown, no #, no **bold**, no tables. Use simple hyphen bullets. No Date, no Subject, no Prepared For, no placeholders like [Insert Date]. Keep it under 300 words.",
    "",
    "Use EXACTLY this structure and these plain-text headings:",
    "",
    `Staff Briefing: ${staff.name}`,
    "",
    "Overview",
    "[2-3 sentences max]",
    "",
    "Key Signals",
    "- [signal]",
    "- [signal]",
    "",
    "Operational Context",
    "- [task summary]",
    "- [attendance summary]",
    "- [availability summary]",
    "- [performance note category summary]",
    "",
    "Suggested Follow-up",
    "- [safe follow-up action]",
    "- [safe follow-up action]",
    "",
    "Limitations",
    "This briefing is based only on available Project Fable records and should be reviewed before use.",
  ].join("\n");
}

export async function getStaffBriefPrompt(staffId: string) {
  const staff = await getStaffDetailById(staffId);

  if (!staff) {
    return null;
  }

  return { prompt: buildStaffBriefText(staff), staffName: staff.name };
}

export async function getWeeklyBriefPrompt() {
  const data = await getPeopleIntelligence();
  const { orgSummary, attentionCounts, attentionList, workload, weeklyOps } = data;

  const attentionLines =
    attentionList.length > 0
      ? attentionList
          .slice(0, 10)
          .map(
            (entry) =>
              `- ${entry.name} (${entry.department ?? "No department"}) — ${entry.level}: ${
                entry.reasons.join(", ") || "no specific reasons"
              }`,
          )
          .join("\n")
      : "- All active staff are stable.";

  const topOpenLines =
    workload.topOpen.length > 0
      ? workload.topOpen.map((member) => `- ${member.name}: ${member.openTasks} open`).join("\n")
      : "- None";

  return [
    "Write a weekly people-operations briefing for a manager using ONLY the records below.",
    "",
    "Records:",
    `- Active staff: ${orgSummary.activeStaff}`,
    `- Open tasks: ${orgSummary.openTasks}`,
    `- Overdue tasks: ${orgSummary.overdueTasks}`,
    `- Blocked tasks: ${orgSummary.blockedTasks}`,
    `- Attendance issues: ${orgSummary.attendanceIssues}`,
    `- Warning notes: ${orgSummary.warningNotes}`,
    `- Improvement notes: ${orgSummary.improvementNotes}`,
    `- Unassigned open tasks: ${orgSummary.unassignedOpenTasks}`,
    `- Staff with no availability records: ${orgSummary.staffNoAvailability}`,
    `- Staff with no open task: ${orgSummary.staffNoOpenTask}`,
    `- Attention counts: ${attentionCounts.attention} need attention, ${attentionCounts.followUp} follow-up, ${attentionCounts.stable} stable`,
    `- Last ${weeklyOps.windowDays} days: ${weeklyOps.completedRecently} tasks completed, ${weeklyOps.currentlyOverdue} currently overdue, ${weeklyOps.attendanceIssuesRecently} attendance issues`,
    "",
    "Staff needing attention or follow-up:",
    attentionLines,
    "",
    "Most open tasks:",
    topOpenLines,
    "",
    "Rules: plain text only, no markdown, no #, no **bold**, no tables. Use simple hyphen bullets. No Date, no Subject, no Prepared For, no placeholders like [Insert Date]. Keep it under 350 words. Do not repeat metrics that are zero; focus on meaningful signals. Summarize groups and counts; do not list many names inline (mention at most 3 example names where useful). If all active staff lack availability records, summarize that clearly instead of listing names.",
    "",
    "Use EXACTLY this structure and these plain-text headings:",
    "",
    "Weekly People Ops Brief",
    "",
    "Overview",
    "[2-3 sentences max]",
    "",
    "Key Signals",
    "- [organization-level signal]",
    "- [organization-level signal]",
    "",
    "Workload Notes",
    "- [task/workload summary]",
    "- [capacity/unassigned task summary]",
    "",
    "Staff Follow-up Areas",
    "- [summarize groups/counts, do not list too many names inline]",
    "- [mention examples only if useful, max 3 names]",
    "",
    "Suggested Follow-up",
    "- [safe follow-up action]",
    "- [safe follow-up action]",
    "",
    "Limitations",
    "This briefing is based only on available Project Fable records and should be reviewed before use.",
  ].join("\n");
}

