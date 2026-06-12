import PageHeader from "@/components/ui/PageHeader";
import { createStaffAction } from "@/app/staff/actions";
import StaffForm from "@/app/staff/StaffForm";
import { requireUser } from "@/lib/auth/session";
import { listDepartmentOptions } from "@/lib/services/departments";

type NewStaffPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewStaffPage({ searchParams }: NewStaffPageProps) {
  await requireUser();

  const params = searchParams ? await searchParams : {};
  const departments = await listDepartmentOptions();

  return (
    <div>
      <PageHeader title="Add Staff" description="Create a staff profile for your organization." />
      <StaffForm
        action={createStaffAction}
        departments={departments}
        submitLabel="Create Staff"
        error={params.error}
      />
    </div>
  );
}
