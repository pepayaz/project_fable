import { getStaffDetailById } from "@/lib/services/staff";
import { buildStaffSnapshot } from "@/lib/services/staff-activity";
import { getPeopleIntelligence } from "@/lib/services/people-intelligence";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";

const TONES = ["Neutral", "Concise", "Supportive"] as const;
const MAX_CONTEXT_LENGTH = 500;

export type WritingInput = {
  tone?: string;
  context?: string;
  category?: string;
};

function normalizeTone(tone?: string) {
  return (TONES as readonly string[]).includes(tone ?? "") ? (tone as string) : "Neutral";
}

function normalizeContext(context?: string) {
  if (typeof context !== "string") {
    return "";
  }
  return context.trim().slice(0, MAX_CONTEXT_LENGTH);
}

function normalizeCategory(category?: string) {
  return (performanceNoteCategories as readonly string[]).includes(category ?? "")
    ? (category as string)
    : "GENERAL";
}

type StaffDetail = NonNullable<Awaited<ReturnType<typeof getStaffDetailById>>>;

function staffFactLines(staff: StaffDetail) {
  const snapshot = buildStaffSnapshot(staff);
  const notesByCategory = snapshot.notesByCategory
    .map((entry) => `${entry.category}: ${entry.count}`)
    .join(", ");

  return [
    `- Name: ${staff.name}`,
    `- Position: ${staff.position ?? "Not set"}`,
    `- Department: ${staff.department?.name ?? "Unassigned"}`,
    `- Status: ${staff.status}`,
    `- Signal: ${snapshot.signal}`,
    `- Signal reasons: ${snapshot.reasons.length > 0 ? snapshot.reasons.join(", ") : "none"}`,
    `- Open tasks: ${snapshot.openTasks}`,
    `- Overdue tasks: ${snapshot.overdueTasks}`,
    `- Attendance issues: ${snapshot.attendanceIssues}`,
    `- Availability records: ${snapshot.availabilityCount}`,
    `- Performance note category counts: ${notesByCategory}`,
  ];
}

function followupFactLines(staff: StaffDetail) {
  const snapshot = buildStaffSnapshot(staff);

  return [
    `- Name: ${staff.name}`,
    `- Missing availability: ${snapshot.availabilityCount === 0 ? "yes" : "no"}`,
    `- Open tasks: ${snapshot.openTasks}`,
    `- Overdue tasks: ${snapshot.overdueTasks}`,
    `- Attendance issues: ${snapshot.attendanceIssues}`,
  ];
}

function contextLine(context: string) {
  return context
    ? `Manager context (optional, use only if relevant): ${context}`
    : "Manager context: none.";
}

export async function getFollowupDraftPrompt(staffId: string, input: WritingInput) {
  const staff = await getStaffDetailById(staffId);
  if (!staff) {
    return null;
  }

  const tone = normalizeTone(input.tone);
  const context = normalizeContext(input.context);

  const prompt = [
    "Write a short follow-up message a manager could send to this staff member, using ONLY the records below.",
    "",
    "Records:",
    ...followupFactLines(staff),
    "",
    `Preferred tone: ${tone}.`,
    contextLine(context),
    "",
    "Rules: plain text only, no markdown, no Date/Subject. Keep it under 150 words. Supportive and neutral. Do not mention performance note contents. Do not threaten or make any HR decision.",
    "Use only these actionable operational signals: missing availability, open tasks, overdue tasks, or attendance follow-up.",
    "Do not mention staff status labels such as ACTIVE or INACTIVE unless Manager context explicitly asks you to mention staff status.",
    "Never write a phrase like 'regarding your status as INACTIVE' or any similar status-focused phrasing.",
    "If there is not enough actionable signal to draft a useful message, ask the manager to add specific context instead of inventing a reason.",
    "",
    "Use EXACTLY this structure:",
    "",
    "Follow-up Message Draft",
    "",
    "Message",
    "[2-5 short sentences addressed to the staff member]",
    "",
    "Limitations",
    "This message is a draft based only on available Project Fable records and should be reviewed before sending.",
  ].join("\n");

  return { prompt, staffName: staff.name };
}

export async function getPerformanceNoteDraftPrompt(staffId: string, input: WritingInput) {
  const staff = await getStaffDetailById(staffId);
  if (!staff) {
    return null;
  }

  const tone = normalizeTone(input.tone);
  const context = normalizeContext(input.context);
  const category = normalizeCategory(input.category);

  const prompt = [
    "Write a draft performance note a manager could refine and save, using ONLY the records below.",
    "",
    "Records:",
    ...staffFactLines(staff),
    `- Selected category: ${category}`,
    "",
    `Preferred tone: ${tone}.`,
    contextLine(context),
    "",
    "Rules: plain text only, no markdown, no Date/Subject. Keep it under 120 words. Neutral and factual. Do not assign a score. Do not write accusations or diagnose. Do not invent incidents. If the category is WARNING but the records do not clearly support a concern, keep the note neutral and factual rather than alarming.",
    "Respect the selected category exactly. Do not choose, change, or override the category.",
    "Do not turn absence of data into a positive or negative performance conclusion.",
    "If the selected category requires evidence that is not available, ask the manager to add specific context.",
    "Category rules:",
    "- POSITIVE: do not use missing availability, lack of tasks, or absence of records as positive note content. If there is no specific positive evidence in the records or Manager context, say that specific positive context is needed before saving.",
    "- WARNING: do not accuse or make hard conclusions when evidence is limited. If evidence is not enough, ask the manager to add specific context.",
    "- IMPROVEMENT: focus on actionable improvement areas, not judgment.",
    "- GENERAL: summarize neutral facts only.",
    "",
    "Use EXACTLY this structure:",
    "",
    "Performance Note Draft",
    "",
    "Note",
    "[2-4 short factual sentences suitable for the selected category]",
    "",
    "Limitations",
    "This note is a draft based only on available Project Fable records and should be reviewed and edited before saving.",
  ].join("\n");

  return { prompt, staffName: staff.name };
}

export async function getAvailabilityReminderPrompt(staffId: string | null, input: WritingInput) {
  const tone = normalizeTone(input.tone);
  const context = normalizeContext(input.context);

  if (staffId) {
    const staff = await getStaffDetailById(staffId);
    if (!staff) {
      return null;
    }

    const snapshot = buildStaffSnapshot(staff);
    const prompt = [
      "Write a short, polite reminder asking this staff member to update their weekly availability, using ONLY the records below.",
      "",
      "Records:",
      `- Name: ${staff.name}`,
      `- Availability records: ${snapshot.availabilityCount}`,
      "",
      `Preferred tone: ${tone}.`,
      contextLine(context),
      "",
      "Rules: plain text only, no markdown, no Date/Subject. Keep it under 120 words. Polite, neutral, and supportive. Explain briefly why availability helps operational planning. Do not threaten or make any HR decision.",
      "",
      "Use EXACTLY this structure:",
      "",
      "Availability Reminder Draft",
      "",
      "Message",
      "[2-4 short sentences addressed to the staff member]",
      "",
      "Limitations",
      "This message is a draft based only on available Project Fable records and should be reviewed before sending.",
    ].join("\n");

    return { prompt, staffName: staff.name };
  }

  const data = await getPeopleIntelligence();
  const prompt = [
    "Write a short, polite team-wide reminder asking staff to update their weekly availability, using ONLY the records below.",
    "",
    "Records:",
    `- Active staff: ${data.orgSummary.activeStaff}`,
    `- Staff with no availability records: ${data.orgSummary.staffNoAvailability}`,
    "",
    `Preferred tone: ${tone}.`,
    contextLine(context),
    "",
    "Rules: plain text only, no markdown, no Date/Subject. Keep it under 130 words. Polite, neutral, and supportive. Address the team in general, do not name individuals. Explain briefly why availability helps operational planning.",
    "",
    "Use EXACTLY this structure:",
    "",
    "Team Availability Reminder Draft",
    "",
    "Message",
    "[3-5 short sentences addressed to the team]",
    "",
    "Limitations",
    "This message is a draft based only on available Project Fable records and should be reviewed before sending.",
  ].join("\n");

  return { prompt, staffName: null };
}

