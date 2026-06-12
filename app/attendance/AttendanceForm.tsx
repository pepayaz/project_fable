import Link from "next/link";
import { attendanceStatuses } from "@/lib/validations/attendance";

type StaffOption = {
  id: string;
  name: string;
};

type AttendanceFormProps = {
  action: (formData: FormData) => Promise<void>;
  staff: StaffOption[];
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    staffId?: string;
    eventName?: string;
    date?: Date;
    status?: string;
    notes?: string | null;
  };
};

function dateInputValue(value?: Date) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

export default function AttendanceForm({
  action,
  staff,
  submitLabel,
  error,
  defaultValues,
}: AttendanceFormProps) {
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
          <label htmlFor="staffId" className="block text-sm font-medium text-text-primary">
            Staff
          </label>
          <select
            id="staffId"
            name="staffId"
            required
            defaultValue={defaultValues?.staffId ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            <option value="">Choose staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-text-primary">
            Event name
          </label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            required
            defaultValue={defaultValues?.eventName ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-text-primary">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={dateInputValue(defaultValues?.date)}
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
            defaultValue={defaultValues?.status ?? "PRESENT"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {attendanceStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
          href="/attendance"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
