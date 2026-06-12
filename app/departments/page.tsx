import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { deleteDepartmentAction } from "@/app/departments/actions";
import { listDepartments } from "@/lib/services/departments";

type DepartmentsPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  const departments = await listDepartments();
  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Group staff into divisions and departments."
        actions={
          <Link
            href="/departments/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Department
          </Link>
        }
      />
      {params.error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </div>
      )}
      {departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department to structure your organization."
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
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/departments/${department.id}/edit`}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      <form action={deleteDepartmentAction}>
                        <input type="hidden" name="id" value={department.id} />
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
