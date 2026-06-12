import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { updateAttendanceAction } from "@/app/attendance/actions";
import AttendanceForm from "@/app/attendance/AttendanceForm";
import { getAttendanceById } from "@/lib/services/attendance";
import { listStaffOptions } from "@/lib/services/staff";

type EditAttendancePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditAttendancePage({
  params,
  searchParams,
}: EditAttendancePageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [record, staff] = await Promise.all([getAttendanceById(id), listStaffOptions()]);

  if (!record) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Attendance" description="Update an attendance record." />
      <AttendanceForm
        action={updateAttendanceAction}
        staff={staff}
        submitLabel="Save Changes"
        error={query.error}
        defaultValues={record}
      />
    </div>
  );
}
