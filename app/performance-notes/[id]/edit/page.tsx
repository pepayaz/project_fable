import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updatePerformanceNoteAction } from "@/app/performance-notes/actions";
import PerformanceNoteForm from "@/app/performance-notes/PerformanceNoteForm";
import { getPerformanceNoteById } from "@/lib/services/performance-notes";
import { listStaffOptions } from "@/lib/services/staff";

type EditPerformanceNotePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditPerformanceNotePage({
  params,
  searchParams,
}: EditPerformanceNotePageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [performanceNote, staff] = await Promise.all([
    getPerformanceNoteById(id),
    listStaffOptions(),
  ]);

  if (!performanceNote) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Performance Note" description="Update a documented staff note." />
      <PerformanceNoteForm
        action={updatePerformanceNoteAction}
        staff={staff}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={performanceNote}
      />
    </div>
  );
}
