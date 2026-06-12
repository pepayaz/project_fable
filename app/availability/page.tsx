import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function AvailabilityPage() {
  return (
    <div>
      <PageHeader
        title="Availability"
        description="See when staff are available during the week."
      />
      <EmptyState
        title="No availability records yet"
        description="Record staff availability to plan tasks and events fairly. Availability tracking arrives in Milestone 4."
      />
    </div>
  );
}
