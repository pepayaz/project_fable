import Link from "next/link";

export type BarTone = "primary" | "success" | "warning" | "danger" | "info" | "muted";

export type HorizontalBarItem = {
  label: string;
  value: number;
  detail?: string;
  href?: string;
  tone?: BarTone;
};

const barToneClass: Record<BarTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-text-subtle",
};

function ItemLabel({ item }: { item: HorizontalBarItem }) {
  if (!item.href) {
    return <span className="truncate text-sm text-text-secondary">{item.label}</span>;
  }

  return (
    <Link href={item.href} className="truncate text-sm text-text-secondary hover:text-primary">
      {item.label}
    </Link>
  );
}

export default function HorizontalBarList({
  items,
  emptyLabel = "No data available.",
  emptyMessage,
  maxValue,
}: {
  items: HorizontalBarItem[];
  emptyLabel?: string;
  emptyMessage?: string;
  maxValue?: number;
}) {
  const visibleItems = items.filter((item) => item.value > 0);
  const scale = maxValue ?? Math.max(...visibleItems.map((item) => item.value), 0);

  if (visibleItems.length === 0) {
    return <p className="text-sm text-text-muted">{emptyMessage ?? emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {visibleItems.map((item) => {
        const width = scale > 0 ? Math.max(6, Math.round((item.value / scale) * 100)) : 0;

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <ItemLabel item={item} />
              <span className="shrink-0 text-sm font-medium text-text-primary">
                {item.detail ?? item.value}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${barToneClass[item.tone ?? "primary"]}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
