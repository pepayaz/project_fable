import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MyAvailabilityForm from "@/app/my/MyAvailabilityForm";
import { createMyAvailabilityAction } from "@/app/my/availability/actions";
import { requirePermission } from "@/lib/auth/guards";
import { getMyStaff } from "@/lib/services/my-workspace";

type NewMyAvailabilityPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewMyAvailabilityPage({ searchParams }: NewMyAvailabilityPageProps) {
  const user = await requirePermission("my:availability:manage");
  const staff = await getMyStaff(user);

  if (!staff) {
    redirect("/my");
  }

  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader title="Add Availability" description="Record when you are available during the week." />
      <MyAvailabilityForm
        action={createMyAvailabilityAction}
        submitLabel="Add Availability"
        error={params.error}
      />
    </div>
  );
}
