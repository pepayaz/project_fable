import PageHeader from "@/components/ui/PageHeader";
import { createAttendanceAction } from "@/app/attendance/actions";
import AttendanceForm from "@/app/attendance/AttendanceForm";
import { requireUser } from "@/lib/auth/session";
import { listStaffOptions } from "@/lib/services/staff";

type NewAttendancePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewAttendancePage({ searchParams }: NewAttendancePageProps) {
  await requireUser();

  const params = searchParams ? await searchParams : {};
  const staff = await listStaffOptions();

  return (
    <div>
      <PageHeader
        title="Add Attendance"
        description="Record staff attendance for a meeting or event."
      />
      <AttendanceForm
        action={createAttendanceAction}
        staff={staff}
        submitLabel="Create Attendance"
        error={params.error}
      />
    </div>
  );
}
