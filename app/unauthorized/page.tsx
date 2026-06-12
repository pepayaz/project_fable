import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { getDefaultRedirectForRole } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export default async function UnauthorizedPage() {
  const user = await requireUser();
  const href = getDefaultRedirectForRole(user.role);

  return (
    <div>
      <PageHeader
        title="Unauthorized"
        description="Your account does not have permission to access this page or action."
        actions={
          <Link
            href={href}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Go Back
          </Link>
        }
      />
    </div>
  );
}
