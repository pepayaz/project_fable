type MetricCardProps = {
  label: string;
  value: string;
};

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4 shadow-card">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
