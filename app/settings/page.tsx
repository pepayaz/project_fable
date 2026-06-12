import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application settings for your organization."
      />
      <EmptyState
        title="Nothing to configure yet"
        description="Settings will be added in a later milestone."
      />
    </div>
  );
}
