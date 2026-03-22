"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Partner Search", href: "/my-home/search/partner-search" },
  { label: "Keyword Search", href: "/my-home/search/keyword-search" },
  { label: "Search by ID", href: "/my-home/search/search-by-id" },
  { label: "Saved Search", href: "/my-home/search/saved-search" },
  { label: "Highlighted Profiles", href: "/my-home/search/highlighted-profiles" },
  { label: "Discover Profiles", href: "/my-home/search/discover-profiles" },
] as const;

export function SearchTabBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-10 bg-background border-b border-input -mx-4 px-4 overflow-x-auto">
      <nav className="flex gap-0 min-w-max">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
