import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function AttendancePage() {
  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Record and review staff attendance."
      />
      <EmptyState
        title="No attendance records yet"
        description="Record attendance for meetings and events. Attendance tracking arrives in Milestone 4."
      />
    </div>
  );
}
