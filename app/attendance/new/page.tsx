import PageHeader from "@/components/ui/PageHeader";
import { createAttendanceAction } from "@/app/attendance/actions";
import AttendanceForm from "@/app/attendance/AttendanceForm";
import { requirePermission } from "@/lib/auth/guards";
import { listStaffOptions } from "@/lib/services/staff";

type NewAttendancePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewAttendancePage({ searchParams }: NewAttendancePageProps) {
  await requirePermission("attendance:create");

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
