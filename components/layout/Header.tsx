import { logoutAction } from "@/app/logout/actions";
import type { AuthUser } from "@/lib/auth/session";

export default function Header({ user }: { user: AuthUser }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-8">
      <p className="text-sm text-text-muted">Project Fable</p>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-text-primary">{user.name}</p>
          <p className="text-xs text-text-muted">{user.role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
