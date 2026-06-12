import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updateStaffAction } from "@/app/staff/actions";
import StaffForm from "@/app/staff/StaffForm";
import { requireUser } from "@/lib/auth/session";
import { listDepartmentOptions } from "@/lib/services/departments";
import { getStaffById } from "@/lib/services/staff";

type EditStaffPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditStaffPage({ params, searchParams }: EditStaffPageProps) {
  await requireUser();

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [member, departments] = await Promise.all([getStaffById(id), listDepartmentOptions()]);

  if (!member) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Staff" description="Update staff profile and department assignment." />
      <StaffForm
        action={updateStaffAction}
        departments={departments}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={member}
      />
    </div>
  );
}
