type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-card">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{description}</p>
    </div>
  );
}
