import Link from "next/link";
import { performanceNoteCategories } from "@/lib/validations/performance-notes";

type StaffOption = {
  id: string;
  name: string;
};

type PerformanceNoteFormProps = {
  action: (formData: FormData) => Promise<void>;
  staff: StaffOption[];
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    staffId?: string;
    category?: string;
    note?: string;
  };
};

export default function PerformanceNoteForm({
  action,
  staff,
  submitLabel,
  error,
  defaultValues,
}: PerformanceNoteFormProps) {
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
          <label htmlFor="category" className="block text-sm font-medium text-text-primary">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={defaultValues?.category ?? "GENERAL"}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            {performanceNoteCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="note" className="block text-sm font-medium text-text-primary">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            rows={6}
            required
            defaultValue={defaultValues?.note ?? ""}
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
          href="/performance-notes"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
