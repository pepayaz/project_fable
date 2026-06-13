import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { buildTemplateCsv } from "@/lib/services/data-export";
import { importEntitySchema } from "@/lib/validations/data-tools";

export async function GET(request: NextRequest) {
  await requirePermission("export:read");
  const entity = importEntitySchema.safeParse(request.nextUrl.searchParams.get("entity"));

  if (!entity.success) {
    return new Response("Invalid template entity.", { status: 400 });
  }

  return new Response(buildTemplateCsv(entity.data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="project-fable-${entity.data}-template.csv"`,
    },
  });
}
