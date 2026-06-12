import PageHeader from "@/components/ui/PageHeader";
import { createAvailabilityAction } from "@/app/availability/actions";
import AvailabilityForm from "@/app/availability/AvailabilityForm";
import { requirePermission } from "@/lib/auth/guards";
import { listStaffOptions } from "@/lib/services/staff";

type NewAvailabilityPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewAvailabilityPage({ searchParams }: NewAvailabilityPageProps) {
  await requirePermission("availability:create");

  const params = searchParams ? await searchParams : {};
  const staff = await listStaffOptions();

  return (
    <div>
      <PageHeader title="Add Availability" description="Record when a staff member is available." />
      <AvailabilityForm
        action={createAvailabilityAction}
        staff={staff}
        submitLabel="Create Availability"
        error={params.error}
      />
    </div>
  );
}
