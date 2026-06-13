import PageHeader from "@/components/ui/PageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { listStaffOptions } from "@/lib/services/staff";
import { listUsers } from "@/lib/services/users";
import { userRoles } from "@/lib/validations/users";
import {
  createUserAction,
  linkUserToStaffAction,
  setUserActiveAction,
  unlinkUserFromStaffAction,
  updateUserRoleAction,
} from "@/app/users/actions";

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
        active ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function FormSelect({
  name,
  defaultValue,
  children,
}: {
  name: string;
  defaultValue?: string | null;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
    >
      {children}
    </select>
  );
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requirePermission("users:read");
  const raw = searchParams ? await searchParams : {};
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const success = typeof raw.success === "string" ? raw.success : undefined;
  const [users, staffOptions] = await Promise.all([listUsers(), listStaffOptions()]);

  return (
    <div>
      <PageHeader title="Users" description="Manage application accounts, roles, status, and staff links." />

      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-md border border-success-soft bg-success-soft px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <section className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary">Create User</h2>
        <p className="mt-1 text-sm text-text-muted">
          Temporary passwords are hashed immediately and are not shown again.
        </p>
        <form action={createUserAction} className="mt-4 grid gap-3 lg:grid-cols-3">
          <input
            name="name"
            placeholder="Name"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
          />
          <FormSelect name="role" defaultValue="MEMBER">
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </FormSelect>
          <input
            name="temporaryPassword"
            type="password"
            placeholder="Temporary password"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
          />
          <FormSelect name="linkedStaffId">
            <option value="">No linked staff</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </FormSelect>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Create User
          </button>
        </form>
      </section>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Linked Staff</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-muted">
                <td className="px-4 py-4">
                  <p className="font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </td>
                <td className="px-4 py-4">
                  <form action={updateUserRoleAction} className="flex gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <FormSelect name="role" defaultValue={user.role}>
                      {userRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </FormSelect>
                    <button className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <Badge active={user.isActive} />
                    <form action={setUserActiveAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="isActive" value={String(!user.isActive)} />
                      <button className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted">
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="mb-2 text-text-secondary">
                    {user.linkedStaff?.deletedAt
                      ? `${user.linkedStaff.name} (deleted)`
                      : user.linkedStaff?.name ?? "Not linked"}
                  </p>
                  <form action={linkUserToStaffAction} className="flex gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <FormSelect name="linkedStaffId" defaultValue={user.linkedStaffId}>
                      <option value="">Choose staff</option>
                      {staffOptions.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </FormSelect>
                    <button className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted">
                      Link
                    </button>
                  </form>
                  {user.linkedStaffId && (
                    <form action={unlinkUserFromStaffAction} className="mt-2">
                      <input type="hidden" name="id" value={user.id} />
                      <button className="text-sm font-medium text-danger hover:underline">
                        Unlink staff
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-4 py-4 text-right text-text-muted">No delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
