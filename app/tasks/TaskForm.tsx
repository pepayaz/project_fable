import Link from "next/link";
import { taskPriorities, taskStatuses } from "@/lib/validations/task";

type Option = {
  id: string;
  name: string;
};

type TaskFormProps = {
  action: (formData: FormData) => Promise<void>;
  staff: Option[];
  departments: Option[];
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    deadline?: Date | null;
    assignedToStaffId?: string | null;
    departmentId?: string | null;
  };
};

function dateInputValue(value?: Date | null) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

export default function TaskForm({
  action,
  staff,
  departments,
  submitLabel,
  error,
  defaultValues,
}: TaskFormProps) {
  return (
    <form action={action} className="max-w-3xl rounded-lg border border-border bg-surface p-6 shadow-card">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-text-primary">
            Task title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={defaultValues?.title ?? ""}
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
            defaultValue={defaultValues?.status ?? "TODO"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-text-primary">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={defaultValues?.priority ?? "MEDIUM"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-text-primary">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={dateInputValue(defaultValues?.deadline)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="assignedToStaffId" className="block text-sm font-medium text-text-primary">
            Assigned staff
          </label>
          <select
            id="assignedToStaffId"
            name="assignedToStaffId"
            defaultValue={defaultValues?.assignedToStaffId ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            <option value="">Unassigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
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
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-text-primary">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={defaultValues?.description ?? ""}
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
          href="/tasks"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
