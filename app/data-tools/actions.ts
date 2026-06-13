"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { confirmImport, previewImport, type ImportPreviewReport } from "@/lib/services/data-import";
import { getServiceErrorMessage } from "@/lib/services/errors";
import { recordAuditLog } from "@/lib/services/audit-log";
import { importEntitySchema, type ImportEntity } from "@/lib/validations/data-tools";

export type ImportActionState = {
  entity: ImportEntity;
  csvText: string;
  report: ImportPreviewReport | null;
  error: string | null;
  success: string | null;
};

const initialEntity: ImportEntity = "departments";

function parseForm(formData: FormData) {
  const entity = importEntitySchema.parse(formData.get("entity"));
  const csvText = String(formData.get("csvText") ?? "");
  return { entity, csvText };
}

export const initialImportState: ImportActionState = {
  entity: initialEntity,
  csvText: "",
  report: null,
  error: null,
  success: null,
};

export async function previewImportAction(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requirePermission("import:manage");
  const { entity, csvText } = parseForm(formData);

  try {
    const report = await previewImport(entity, csvText);
    return { entity, csvText, report, error: null, success: null };
  } catch (error) {
    return {
      entity,
      csvText,
      report: null,
      error: getServiceErrorMessage(error, "CSV could not be previewed."),
      success: null,
    };
  }
}

export async function confirmImportAction(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const actor = await requirePermission("import:manage");
  const { entity, csvText } = parseForm(formData);

  try {
    const imported = await confirmImport(entity, csvText);
    await recordAuditLog({
      action: "IMPORT",
      entityType: "DataImport",
      entityId: entity,
      summary: `Imported ${imported} ${entity} row${imported === 1 ? "" : "s"}`,
      actor,
    });
    revalidatePath("/data-tools");
    revalidatePath(`/${entity === "departments" ? "departments" : entity}`);
    return {
      entity,
      csvText: "",
      report: null,
      error: null,
      success: `Imported ${imported} row${imported === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    const report = await previewImport(entity, csvText).catch(() => null);
    return {
      entity,
      csvText,
      report,
      error: getServiceErrorMessage(error, "CSV could not be imported."),
      success: null,
    };
  }
}
