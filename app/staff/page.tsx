import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function StaffPage() {
  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage the members of your organization."
      />
      <EmptyState
        title="No staff yet"
        description="Add your first staff member to start organizing your team. Staff management arrives in Milestone 2."
      />
    </div>
  );
}
