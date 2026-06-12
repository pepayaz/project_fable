import Link from "next/link";
import { daysOfWeek } from "@/lib/validations/availability";

type StaffOption = {
  id: string;
  name: string;
};

type AvailabilityFormProps = {
  action: (formData: FormData) => Promise<void>;
  staff: StaffOption[];
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    staffId?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    notes?: string | null;
  };
};

export default function AvailabilityForm({
  action,
  staff,
  submitLabel,
  error,
  defaultValues,
}: AvailabilityFormProps) {
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
          <label htmlFor="dayOfWeek" className="block text-sm font-medium text-text-primary">
            Day
          </label>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            defaultValue={defaultValues?.dayOfWeek ?? "MONDAY"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-text-primary">
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            defaultValue={defaultValues?.startTime ?? ""}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-text-primary">
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            defaultValue={defaultValues?.endTime ?? ""}
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
          href="/availability"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
