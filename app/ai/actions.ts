"use server";

import { requirePermission } from "@/lib/auth/guards";
import { getAiProvider } from "@/lib/ai";
import { AI_SAFETY_SYSTEM, AI_WRITING_SAFETY } from "@/lib/ai/safety";
import type { AiResult } from "@/lib/ai/provider";
import { recordAuditLog } from "@/lib/services/audit-log";
import { getStaffBriefPrompt, getWeeklyBriefPrompt } from "@/lib/services/ai-brief";
import {
  getAvailabilityReminderPrompt,
  getFollowupDraftPrompt,
  getPerformanceNoteDraftPrompt,
  type WritingInput,
} from "@/lib/services/ai-writing";

export async function generateStaffBriefAction(staffId: string): Promise<AiResult> {
  const user = await requirePermission("ai:generate");

  const provider = getAiProvider();
  if (!provider) {
    return { status: "not_configured" };
  }

  const brief = await getStaffBriefPrompt(staffId);
  if (!brief) {
    return { status: "error", message: "Staff not found." };
  }

  const result = await provider.generate({
    system: AI_SAFETY_SYSTEM,
    user: brief.prompt,
    maxTokens: 700,
  });

  if (result.status === "ok") {
    await recordAuditLog({
      action: "GENERATE",
      entityType: "AiBrief",
      entityId: staffId,
      summary: `Generated AI staff brief for ${brief.staffName}`,
      actor: user,
    });
  }

  return result;
}

export async function generateWeeklyBriefAction(): Promise<AiResult> {
  const user = await requirePermission("ai:generate");

  const provider = getAiProvider();
  if (!provider) {
    return { status: "not_configured" };
  }

  const prompt = await getWeeklyBriefPrompt();
  const result = await provider.generate({
    system: AI_SAFETY_SYSTEM,
    user: prompt,
    maxTokens: 800,
  });

  if (result.status === "ok") {
    await recordAuditLog({
      action: "GENERATE",
      entityType: "AiBrief",
      entityId: "weekly",
      summary: "Generated AI weekly brief",
      actor: user,
    });
  }

  return result;
}

export async function generateFollowupDraftAction(
  staffId: string,
  input: WritingInput,
): Promise<AiResult> {
  const user = await requirePermission("ai:generate");

  const provider = getAiProvider();
  if (!provider) {
    return { status: "not_configured" };
  }

  const draft = await getFollowupDraftPrompt(staffId, input);
  if (!draft) {
    return { status: "error", message: "Staff not found." };
  }

  const result = await provider.generate({
    system: AI_WRITING_SAFETY,
    user: draft.prompt,
    maxTokens: 500,
  });

  if (result.status === "ok") {
    await recordAuditLog({
      action: "GENERATE",
      entityType: "AiWriting",
      entityId: staffId,
      summary: `Generated AI follow-up message draft for ${draft.staffName}`,
      actor: user,
    });
  }

  return result;
}

export async function generatePerformanceNoteDraftAction(
  staffId: string,
  input: WritingInput,
): Promise<AiResult> {
  const user = await requirePermission("ai:generate");

  const provider = getAiProvider();
  if (!provider) {
    return { status: "not_configured" };
  }

  const draft = await getPerformanceNoteDraftPrompt(staffId, input);
  if (!draft) {
    return { status: "error", message: "Staff not found." };
  }

  const result = await provider.generate({
    system: AI_WRITING_SAFETY,
    user: draft.prompt,
    maxTokens: 450,
  });

  if (result.status === "ok") {
    await recordAuditLog({
      action: "GENERATE",
      entityType: "AiWriting",
      entityId: staffId,
      summary: `Generated AI performance note draft for ${draft.staffName}`,
      actor: user,
    });
  }

  return result;
}

export async function generateAvailabilityReminderAction(
  staffId: string | null,
  input: WritingInput,
): Promise<AiResult> {
  const user = await requirePermission("ai:generate");

  const provider = getAiProvider();
  if (!provider) {
    return { status: "not_configured" };
  }

  const draft = await getAvailabilityReminderPrompt(staffId, input);
  if (!draft) {
    return { status: "error", message: "Staff not found." };
  }

  const result = await provider.generate({
    system: AI_WRITING_SAFETY,
    user: draft.prompt,
    maxTokens: 450,
  });

  if (result.status === "ok") {
    await recordAuditLog({
      action: "GENERATE",
      entityType: "AiWriting",
      entityId: staffId ?? "team",
      summary: draft.staffName
        ? `Generated AI availability reminder draft for ${draft.staffName}`
        : "Generated AI team availability reminder draft",
      actor: user,
    });
  }

  return result;
}
