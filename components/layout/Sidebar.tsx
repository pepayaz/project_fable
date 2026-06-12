"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 pt-6 pb-4">
        <p className="text-lg font-semibold text-text-primary">Project Fable</p>
        <p className="text-xs text-text-muted">People management</p>
      </div>
      <nav className="flex flex-col gap-1 px-3 pb-6">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-md bg-primary-soft px-3 py-2 text-sm font-medium text-primary"
                  : "rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
