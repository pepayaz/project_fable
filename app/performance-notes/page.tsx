import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function PerformanceNotesPage() {
  return (
    <div>
      <PageHeader
        title="Performance Notes"
        description="Keep simple, documented notes on staff performance."
      />
      <EmptyState
        title="No performance notes yet"
        description="Document staff performance to make evaluations fairer. Performance notes arrive in Milestone 4."
      />
    </div>
  );
}
