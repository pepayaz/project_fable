import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updateTaskAction } from "@/app/tasks/actions";
import TaskForm from "@/app/tasks/TaskForm";
import { listDepartmentOptions } from "@/lib/services/departments";
import { listStaffOptions } from "@/lib/services/staff";
import { getTaskById } from "@/lib/services/tasks";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditTaskPage({ params, searchParams }: EditTaskPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [task, staff, departments] = await Promise.all([
    getTaskById(id),
    listStaffOptions(),
    listDepartmentOptions(),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Task" description="Update task assignment, priority, and deadline." />
      <TaskForm
        action={updateTaskAction}
        staff={staff}
        departments={departments}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={task}
      />
    </div>
  );
}
