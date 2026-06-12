import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterText, FilterSelect } from "@/components/ui/FilterBar";
import { deleteStaffAction } from "@/app/staff/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listStaff } from "@/lib/services/staff";
import { listDepartmentOptions } from "@/lib/services/departments";
import { staffStatuses } from "@/lib/validations/staff";
import { staffListParamsSchema, staffSortKeys } from "@/lib/validations/list-filters";

type StaffPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof staffSortKeys)[number], string> = {
  name: "Name",
  createdAt: "Created",
  updatedAt: "Updated",
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-success-soft text-success";
    case "PROBATION":
      return "bg-warning-soft text-warning";
    case "RESIGNED":
      return "bg-danger-soft text-danger";
    default:
      return "bg-surface-muted text-text-muted";
  }
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const user = await requirePermission("staff:read");
  const canCreate = can(user, "staff:create");
  const canUpdate = can(user, "staff:update");
  const canDelete = can(user, "staff:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = staffListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const [staff, departments] = await Promise.all([listStaff(filters), listDepartmentOptions()]);
  const hasFilters = Boolean(filters.q || filters.status || filters.department);

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage the members of your organization."
        actions={
          canCreate ? (
          <Link
            href="/staff/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Staff
          </Link>
          ) : null
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {(staff.length > 0 || hasFilters) && (
        <FilterBar basePath="/staff">
          <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Name, email, position" />
          <FilterSelect name="status" label="Status" defaultValue={filters.status ?? ""}>
            <option value="">All</option>
            {staffStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="department" label="Department" defaultValue={filters.department}>
            <option value="">All</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {staffSortKeys.map((key) => (
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
      {staff.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching staff" : "No staff yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Add your first staff member to start organizing your team."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4">
                    <div>
                      <Link
                        href={`/staff/${member.id}`}
                        className="font-medium text-text-primary hover:text-primary"
                      >
                        {member.name}
                      </Link>
                      <p className="text-xs text-text-muted">{member.email ?? "No email"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {member.position ?? "No position"}
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {member.department?.name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusBadgeClass(
                        member.status,
                      )}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/staff/${member.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deleteStaffAction}>
                            <input type="hidden" name="id" value={member.id} />
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
