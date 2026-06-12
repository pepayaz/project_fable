import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { requirePermission } from "@/lib/auth/guards";

export default async function SettingsPage() {
  await requirePermission("settings:read");

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
