import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loginAction } from "@/app/login/actions";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="mb-6">
          <p className="text-xl font-semibold text-text-primary">Project Fable</p>
          <p className="mt-1 text-sm text-text-muted">Sign in to your people operations workspace.</p>
        </div>
        {params.error && (
          <div className="mb-5 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
            {params.error}
          </div>
        )}
        <form action={loginAction} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
