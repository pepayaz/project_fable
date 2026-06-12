import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterText, FilterSelect } from "@/components/ui/FilterBar";
import { deleteTaskAction } from "@/app/tasks/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listTasks } from "@/lib/services/tasks";
import { listStaffOptions } from "@/lib/services/staff";
import { listDepartmentOptions } from "@/lib/services/departments";
import { taskStatuses, taskPriorities } from "@/lib/validations/task";
import { taskListParamsSchema, taskSortKeys } from "@/lib/validations/list-filters";

type TasksPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof taskSortKeys)[number], string> = {
  deadline: "Deadline",
  priority: "Priority",
  createdAt: "Created",
  updatedAt: "Updated",
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "DONE":
      return "bg-success-soft text-success";
    case "IN_PROGRESS":
      return "bg-info-soft text-info";
    case "BLOCKED":
      return "bg-warning-soft text-warning";
    case "CANCELLED":
      return "bg-surface-muted text-text-muted";
    default:
      return "bg-primary-soft text-primary";
  }
}

function priorityBadgeClass(priority: string) {
  switch (priority) {
    case "LOW":
      return "bg-surface-muted text-text-muted";
    case "HIGH":
      return "bg-warning-soft text-warning";
    case "URGENT":
      return "bg-danger-soft text-danger";
    default:
      return "bg-info-soft text-info";
  }
}

function formatDeadline(deadline: Date | null) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(deadline);
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requirePermission("tasks:read");
  const canCreate = can(user, "tasks:create");
  const canUpdate = can(user, "tasks:update");
  const canDelete = can(user, "tasks:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = taskListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const [tasks, staffOptions, departments] = await Promise.all([
    listTasks(filters),
    listStaffOptions(),
    listDepartmentOptions(),
  ]);
  const hasFilters = Boolean(
    filters.q || filters.status || filters.priority || filters.staff || filters.department,
  );

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Assign and track work across your organization."
        actions={
          canCreate ? (
          <Link
            href="/tasks/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Task
          </Link>
          ) : null
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {(tasks.length > 0 || hasFilters) && (
        <FilterBar basePath="/tasks">
          <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Title or description" />
          <FilterSelect name="status" label="Status" defaultValue={filters.status ?? ""}>
            <option value="">All</option>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="priority" label="Priority" defaultValue={filters.priority ?? ""}>
            <option value="">All</option>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="staff" label="Assignee" defaultValue={filters.staff}>
            <option value="">All</option>
            {staffOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="department" label="Department" defaultValue={filters.department}>
            <option value="">All</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {taskSortKeys.map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="dir" label="Direction" defaultValue={filters.dir}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </FilterSelect>
        </FilterBar>
      )}
      {tasks.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching tasks" : "No tasks yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Create tasks and assign them to staff or departments."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{task.title}</p>
                      <p className="max-w-xs truncate text-xs text-text-muted">
                        {task.description ?? "No description"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {task.assignedToStaff?.name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-4 text-text-secondary">
                    {task.department?.name ?? "No department"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusBadgeClass(
                        task.status,
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${priorityBadgeClass(
                        task.priority,
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">{formatDeadline(task.deadline)}</td>
                  <td className="px-4 py-4">
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deleteTaskAction}>
                            <input type="hidden" name="id" value={task.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
