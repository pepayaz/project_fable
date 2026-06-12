import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { deleteStaffAction } from "@/app/staff/actions";
import { listStaff } from "@/lib/services/staff";

type StaffPageProps = {
  searchParams?: Promise<{ error?: string }>;
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
  const staff = await listStaff();
  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage the members of your organization."
        actions={
          <Link
            href="/staff/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Staff
          </Link>
        }
      />
      {params.error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </div>
      )}
      {staff.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Add your first staff member to start organizing your team."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
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
                      <p className="font-medium text-text-primary">{member.name}</p>
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
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/staff/${member.id}/edit`}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      <form action={deleteStaffAction}>
                        <input type="hidden" name="id" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
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
