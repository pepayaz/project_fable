import PageHeader from "@/components/ui/PageHeader";
import { createTaskAction } from "@/app/tasks/actions";
import TaskForm from "@/app/tasks/TaskForm";
import { requireUser } from "@/lib/auth/session";
import { listDepartmentOptions } from "@/lib/services/departments";
import { listStaffOptions } from "@/lib/services/staff";

type NewTaskPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  await requireUser();

  const params = searchParams ? await searchParams : {};
  const [staff, departments] = await Promise.all([listStaffOptions(), listDepartmentOptions()]);

  return (
    <div>
      <PageHeader title="Add Task" description="Create a task for a staff member or department." />
      <TaskForm
        action={createTaskAction}
        staff={staff}
        departments={departments}
        submitLabel="Create Task"
        error={params.error}
      />
    </div>
  );
}
