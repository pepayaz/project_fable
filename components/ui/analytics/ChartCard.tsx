type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-xs text-text-muted">{description}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
