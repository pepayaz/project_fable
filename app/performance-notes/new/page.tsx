import PageHeader from "@/components/ui/PageHeader";
import { createPerformanceNoteAction } from "@/app/performance-notes/actions";
import PerformanceNoteForm from "@/app/performance-notes/PerformanceNoteForm";
import { requireUser } from "@/lib/auth/session";
import { listStaffOptions } from "@/lib/services/staff";

type NewPerformanceNotePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewPerformanceNotePage({
  searchParams,
}: NewPerformanceNotePageProps) {
  await requireUser();

  const params = searchParams ? await searchParams : {};
  const staff = await listStaffOptions();

  return (
    <div>
      <PageHeader title="Add Performance Note" description="Document a simple staff note." />
      <PerformanceNoteForm
        action={createPerformanceNoteAction}
        staff={staff}
        submitLabel="Create Note"
        error={params.error}
      />
    </div>
  );
}
