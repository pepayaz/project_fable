import Link from "next/link";
import DataImportForm from "@/app/data-tools/DataImportForm";
import PageHeader from "@/components/ui/PageHeader";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { exportEntities, importEntities } from "@/lib/validations/data-tools";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function entityLabel(entity: string) {
  return entity === "performance-notes"
    ? "Performance Notes"
    : entity[0].toUpperCase() + entity.slice(1);
}

export default async function DataToolsPage() {
  const user = await requirePermission("export:read");
  const canImport = can(user, "import:manage");
  const visibleExportEntities = exportEntities.filter(
    (entity) => user.role === "ADMIN" || entity !== "performance-notes",
  );

  return (
    <div>
      <PageHeader
        title="Data Tools"
        description="Export operational CSV files, download templates, and import reviewed CSV data."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Export CSV"
          description="Exports active records only. Deleted/trash records and auth secrets are never included."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleExportEntities.map((entity) => (
              <Link
                key={entity}
                href={`/data-tools/export?entity=${entity}`}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              >
                Export {entityLabel(entity)}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Performance Notes export is restricted to ADMIN because it includes full note text.
          </p>
        </Card>

        <Card
          title="CSV Templates"
          description="Download headers for supported imports before preparing data."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {importEntities.map((entity) => (
              <Link
                key={entity}
                href={`/data-tools/template?entity=${entity}`}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              >
                {entityLabel(entity)} template
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5">
        {canImport ? (
          <DataImportForm />
        ) : (
          <Card
            title="Import CSV"
            description="Import is ADMIN-only. Managers can export operational data but cannot import records."
          >
            <p className="text-sm text-text-muted">Ask an ADMIN to preview and import CSV data.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
