"use client";

import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav";

export default function Header() {
  const pathname = usePathname();
  const section = navItems.find((item) => pathname.startsWith(item.href));

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-8">
      <p className="text-sm text-text-muted">{section ? section.label : "Project Fable"}</p>
    </header>
  );
}
