import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function DepartmentsPage() {
  return (
    <div>
      <PageHeader
        title="Departments"
        description="Group staff into divisions and departments."
      />
      <EmptyState
        title="No departments yet"
        description="Create your first department to structure your organization. Department management arrives in Milestone 2."
      />
    </div>
  );
}
