import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MyAvailabilityForm from "@/app/my/MyAvailabilityForm";
import { updateMyAvailabilityAction } from "@/app/my/availability/actions";
import { requirePermission } from "@/lib/auth/guards";
import { getMyAvailabilityById, getMyStaff } from "@/lib/services/my-workspace";

type EditMyAvailabilityPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditMyAvailabilityPage({
  params,
  searchParams,
}: EditMyAvailabilityPageProps) {
  const user = await requirePermission("my:availability:manage");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirect("/my");
  }

  const { id } = await params;
  const record = await getMyAvailabilityById(staff.id, id);

  if (!record) {
    notFound();
  }

  const query = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader title="Edit Availability" description="Update your weekly availability." />
      <MyAvailabilityForm
        action={updateMyAvailabilityAction}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={record}
      />
    </div>
  );
}
