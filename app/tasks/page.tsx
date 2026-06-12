import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Assign and track work across your organization."
      />
      <EmptyState
        title="No tasks yet"
        description="Create tasks and assign them to staff or departments. Task management arrives in Milestone 3."
      />
    </div>
  );
}
