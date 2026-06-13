import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { buildExportCsv, exportFileName, exportLabel } from "@/lib/services/data-export";
import { recordAuditLog } from "@/lib/services/audit-log";
import { exportEntitySchema } from "@/lib/validations/data-tools";
import { getServiceErrorMessage } from "@/lib/services/errors";

export async function GET(request: NextRequest) {
  const actor = await requirePermission("export:read");
  const entity = exportEntitySchema.safeParse(request.nextUrl.searchParams.get("entity"));

  if (!entity.success) {
    return new Response("Invalid export entity.", { status: 400 });
  }

  try {
    const csv = await buildExportCsv(entity.data, actor.role);
    await recordAuditLog({
      action: "EXPORT",
      entityType: "DataExport",
      entityId: entity.data,
      summary: `Exported ${exportLabel(entity.data)} CSV`,
      actor,
    });

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFileName(entity.data)}"`,
      },
    });
  } catch (error) {
    return new Response(getServiceErrorMessage(error, "Export could not be generated."), {
      status: 400,
    });
  }
}
