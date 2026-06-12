import PageHeader from "@/components/ui/PageHeader";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your organization."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Staff" value="0" />
        <MetricCard label="Active Staff" value="0" />
        <MetricCard label="Open Tasks" value="0" />
        <MetricCard label="Overdue Tasks" value="0" />
      </div>
      <div className="mt-6">
        <EmptyState
          title="No data yet"
          description="Start by adding departments and staff. Staff and department management arrives in the next milestone."
        />
      </div>
    </div>
  );
}
