import Link from "next/link";

type DepartmentFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  error?: string;
  defaultValues?: {
    id?: string;
    name?: string;
    description?: string | null;
  };
};

export default function DepartmentForm({
  action,
  submitLabel,
  error,
  defaultValues,
}: DepartmentFormProps) {
  return (
    <form action={action} className="max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-card">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">
            Department name
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
          href="/departments"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
