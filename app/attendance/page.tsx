import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterText, FilterSelect } from "@/components/ui/FilterBar";
import { deleteAttendanceAction } from "@/app/attendance/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listAttendanceRecords } from "@/lib/services/attendance";
import { listStaffOptions } from "@/lib/services/staff";
import { attendanceStatuses } from "@/lib/validations/attendance";
import { attendanceListParamsSchema, attendanceSortKeys } from "@/lib/validations/list-filters";

type AttendancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof attendanceSortKeys)[number], string> = {
  date: "Date",
  createdAt: "Created",
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "PRESENT":
      return "bg-success-soft text-success";
    case "ABSENT":
      return "bg-danger-soft text-danger";
    case "EXCUSED":
      return "bg-info-soft text-info";
    case "SICK":
      return "bg-warning-soft text-warning";
    default:
      return "bg-primary-soft text-primary";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const user = await requirePermission("attendance:read");
  const canCreate = can(user, "attendance:create");
  const canUpdate = can(user, "attendance:update");
  const canDelete = can(user, "attendance:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = attendanceListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const [records, staffOptions] = await Promise.all([
    listAttendanceRecords(filters),
    listStaffOptions(),
  ]);
  const hasFilters = Boolean(filters.q || filters.status || filters.staff);

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Record and review staff attendance."
        actions={
          canCreate ? (
          <Link
            href="/attendance/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Attendance
          </Link>
          ) : null
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {(records.length > 0 || hasFilters) && (
        <FilterBar basePath="/attendance">
          <FilterText name="q" label="Search" defaultValue={filters.q} placeholder="Event name" />
          <FilterSelect name="status" label="Status" defaultValue={filters.status ?? ""}>
            <option value="">All</option>
            {attendanceStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="staff" label="Staff" defaultValue={filters.staff}>
            <option value="">All</option>
            {staffOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {attendanceSortKeys.map((key) => (
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
      {records.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching attendance records" : "No attendance records yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Record attendance for meetings and events."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4 font-medium text-text-primary">{record.staff.name}</td>
                  <td className="px-4 py-4 text-text-secondary">{record.eventName}</td>
                  <td className="px-4 py-4 text-text-secondary">{formatDate(record.date)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusBadgeClass(
                        record.status,
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-secondary">{record.notes ?? "No notes"}</td>
                  <td className="px-4 py-4">
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/attendance/${record.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deleteAttendanceAction}>
                            <input type="hidden" name="id" value={record.id} />
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
