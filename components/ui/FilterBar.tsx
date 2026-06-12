import Link from "next/link";

export default function FilterBar({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <form
      method="get"
      action={basePath}
      className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      {children}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Apply
        </button>
        <Link
          href={basePath}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

export function FilterText({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium text-text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-56 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:border-primary-border focus:outline-none"
      />
    </div>
  );
}

export function FilterSelect({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium text-text-muted">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}
