import Link from "next/link";
import { staffStatuses } from "@/lib/validations/staff";

type DepartmentOption = {
  id: string;
  name: string;
};

type StaffFormProps = {
  action: (formData: FormData) => Promise<void>;
  departments: DepartmentOption[];
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
    status?: string;
    batch?: string | null;
    notes?: string | null;
    departmentId?: string | null;
  };
};

export default function StaffForm({
  action,
  departments,
  submitLabel,
  error,
  defaultValues,
}: StaffFormProps) {
  return (
    <form action={action} className="max-w-3xl rounded-lg border border-border bg-surface p-6 shadow-card">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">
            Staff name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultValues?.name ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={defaultValues?.phone ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-text-primary">
            Position
          </label>
          <input
            id="position"
            name="position"
            type="text"
            defaultValue={defaultValues?.position ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-primary">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "ACTIVE"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {staffStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium text-text-primary">
            Department
          </label>
          <select
            id="departmentId"
            name="departmentId"
            defaultValue={defaultValues?.departmentId ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="batch" className="block text-sm font-medium text-text-primary">
            Batch
          </label>
          <input
            id="batch"
            name="batch"
            type="text"
            defaultValue={defaultValues?.batch ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-text-primary">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={defaultValues?.notes ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <Link
          href="/staff"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
