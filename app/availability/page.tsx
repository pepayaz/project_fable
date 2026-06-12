import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar, { FilterSelect } from "@/components/ui/FilterBar";
import { deleteAvailabilityAction } from "@/app/availability/actions";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { listAvailabilityRecords } from "@/lib/services/availability";
import { listStaffOptions } from "@/lib/services/staff";
import { daysOfWeek } from "@/lib/validations/availability";
import { availabilityListParamsSchema, availabilitySortKeys } from "@/lib/validations/list-filters";

type AvailabilityPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sortLabels: Record<(typeof availabilitySortKeys)[number], string> = {
  dayOfWeek: "Day",
  startTime: "Start time",
  createdAt: "Created",
};

export default async function AvailabilityPage({ searchParams }: AvailabilityPageProps) {
  const user = await requirePermission("availability:read");
  const canCreate = can(user, "availability:create");
  const canUpdate = can(user, "availability:update");
  const canDelete = can(user, "availability:delete");
  const raw = searchParams ? await searchParams : {};
  const filters = availabilityListParamsSchema.parse(raw);
  const error = typeof raw.error === "string" ? raw.error : undefined;
  const [records, staffOptions] = await Promise.all([
    listAvailabilityRecords(filters),
    listStaffOptions(),
  ]);
  const hasFilters = Boolean(filters.staff || filters.day);

  return (
    <div>
      <PageHeader
        title="Availability"
        description="See when staff are available during the week."
        actions={
          canCreate ? (
          <Link
            href="/availability/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Availability
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
        <FilterBar basePath="/availability">
          <FilterSelect name="staff" label="Staff" defaultValue={filters.staff}>
            <option value="">All</option>
            {staffOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="day" label="Day" defaultValue={filters.day ?? ""}>
            <option value="">All</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect name="sort" label="Sort by" defaultValue={filters.sort}>
            {availabilitySortKeys.map((key) => (
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
          title={hasFilters ? "No matching availability records" : "No availability records yet"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "Record staff availability to plan tasks and events fairly."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-4 font-medium text-text-primary">{record.staff.name}</td>
                  <td className="px-4 py-4 text-text-secondary">{record.dayOfWeek}</td>
                  <td className="px-4 py-4 text-text-secondary">{record.startTime}</td>
                  <td className="px-4 py-4 text-text-secondary">{record.endTime}</td>
                  <td className="px-4 py-4 text-text-secondary">{record.notes ?? "No notes"}</td>
                  <td className="px-4 py-4">
                    {(canUpdate || canDelete) && (
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Link
                            href={`/availability/${record.id}/edit`}
                            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <form action={deleteAvailabilityAction}>
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
