import type { BarTone } from "@/components/ui/analytics/HorizontalBarList";

type StatusDistributionItem = {
  label: string;
  value: number;
  tone?: BarTone;
};

const segmentToneClass: Record<BarTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-text-subtle",
};

const badgeToneClass: Record<BarTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  muted: "bg-surface-muted text-text-muted",
};

export default function StatusDistribution({
  items,
  emptyLabel = "No data available.",
  emptyMessage,
}: {
  items: StatusDistributionItem[];
  emptyLabel?: string;
  emptyMessage?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <p className="text-sm text-text-muted">{emptyMessage ?? emptyLabel}</p>;
  }

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
        {items
          .filter((item) => item.value > 0)
          .map((item) => (
            <div
              key={item.label}
              className={segmentToneClass[item.tone ?? "primary"]}
              style={{ width: `${(item.value / total) * 100}%` }}
              title={`${item.label}: ${item.value}`}
            />
          ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
              badgeToneClass[item.tone ?? "primary"]
            }`}
          >
            {item.label} - {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
