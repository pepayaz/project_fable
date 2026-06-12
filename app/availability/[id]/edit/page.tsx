import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updateAvailabilityAction } from "@/app/availability/actions";
import AvailabilityForm from "@/app/availability/AvailabilityForm";
import { requireUser } from "@/lib/auth/session";
import { getAvailabilityById } from "@/lib/services/availability";
import { listStaffOptions } from "@/lib/services/staff";

type EditAvailabilityPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditAvailabilityPage({
  params,
  searchParams,
}: EditAvailabilityPageProps) {
  await requireUser();

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [record, staff] = await Promise.all([getAvailabilityById(id), listStaffOptions()]);

  if (!record) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Availability" description="Update staff availability details." />
      <AvailabilityForm
        action={updateAvailabilityAction}
        staff={staff}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={record}
      />
    </div>
  );
}
