import PageHeader from "@/components/ui/PageHeader";
import { createDepartmentAction } from "@/app/departments/actions";
import DepartmentForm from "@/app/departments/DepartmentForm";
import { requirePermission } from "@/lib/auth/guards";

type NewDepartmentPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewDepartmentPage({ searchParams }: NewDepartmentPageProps) {
  await requirePermission("departments:create");

  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader
        title="Add Department"
        description="Create a department or division for organizing staff."
      />
      <DepartmentForm
        action={createDepartmentAction}
        submitLabel="Create Department"
        error={params.error}
      />
    </div>
  );
}
