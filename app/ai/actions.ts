"use server";

import { requirePermission } from "@/lib/auth/guards";
import { getAiProvider } from "@/lib/ai";
import { AI_SAFETY_SYSTEM } from "@/lib/ai/safety";
import type { AiResult } from "@/lib/ai/provider";
import { recordAuditLog } from "@/lib/services/audit-log";
import { getStaffBriefPrompt, getWeeklyBriefPrompt } from "@/lib/services/ai-brief";

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
