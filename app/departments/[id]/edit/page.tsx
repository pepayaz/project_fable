import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updateDepartmentAction } from "@/app/departments/actions";
import DepartmentForm from "@/app/departments/DepartmentForm";
import { requirePermission } from "@/lib/auth/guards";
import { getDepartmentById } from "@/lib/services/departments";

type EditDepartmentPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditDepartmentPage({
  params,
  searchParams,
}: EditDepartmentPageProps) {
  await requirePermission("departments:update");

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const department = await getDepartmentById(id);

  if (!department) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Department"
        description="Update department details used across staff records."
      />
      <DepartmentForm
        action={updateDepartmentAction}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={department}
      />
    </div>
  );
}
