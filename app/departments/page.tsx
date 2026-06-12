import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterText, FilterSelect } from "@/components/ui/FilterBar";
import { deleteDepartmentAction } from "@/app/departments/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listDepartments } from "@/lib/services/departments";
import { departmentListParamsSchema, departmentSortKeys } from "@/lib/validations/list-filters";

type DepartmentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof departmentSortKeys)[number], string> = {
  name: "Name",
  createdAt: "Created",
  updatedAt: "Updated",
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  const user = await requirePermission("departments:read");
  const canCreate = can(user, "departments:create");
  const canUpdate = can(user, "departments:update");
  const canDelete = can(user, "departments:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = departmentListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const departments = await listDepartments(filters);
  const hasFilters = Boolean(filters.q);

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Group staff into divisions and departments."
        actions={
          canCreate ? (
          <Link
            href="/departments/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Department
          </Link>
          ) : null
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {(departments.length > 0 || hasFilters) && (
        <FilterBar basePath="/departments">
          <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Department name" />
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {departmentSortKeys.map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="dir" label="Direction" defaultValue={filters.dir}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </FilterSelect>
        </FilterBar>
      )}
      {departments.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching departments" : "No departments yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Create your first department to structure your organization."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4 font-medium text-text-primary">{department.name}</td>
                  <td className="px-4 py-4 text-text-secondary">
                    {department.description ?? "No description"}
                  </td>
                  <td className="px-4 py-4 text-text-secondary">{department._count.staff}</td>
                  <td className="px-4 py-4">
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/departments/${department.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deleteDepartmentAction}>
                            <input type="hidden" name="id" value={department.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
