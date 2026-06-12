import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { deleteAvailabilityAction } from "@/app/availability/actions";
import { requireUser } from "@/lib/auth/session";
import { listAvailabilityRecords } from "@/lib/services/availability";

type AvailabilityPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AvailabilityPage({ searchParams }: AvailabilityPageProps) {
  await requireUser();
  const records = await listAvailabilityRecords();
  const params = searchParams ? await searchParams : {};

  return (
    <div>
      <PageHeader
        title="Availability"
        description="See when staff are available during the week."
        actions={
          <Link
            href="/availability/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add Availability
          </Link>
        }
      />
      {params.error && (
        <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </div>
      )}
      {records.length === 0 ? (
        <EmptyState
          title="No availability records yet"
          description="Record staff availability to plan tasks and events fairly."
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
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/availability/${record.id}/edit`}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      <form action={deleteAvailabilityAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-danger-soft bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger hover:border-danger"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
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
