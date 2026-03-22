"use client";

import Link from "next/link";

const ALL_DIRECTORIES = [
  { label: "NRI Matrimony", href: "/my-home/search/discover-profiles/nri-matrimony" },
  { label: "Catholic Matrimony", href: "/my-home/search/discover-profiles/catholic-matrimony" },
  { label: "Karnataka Matrimony", href: "/my-home/search/discover-profiles/karnataka-matrimony" },
  { label: "Christian Matrimony", href: "/my-home/search/discover-profiles/christian-matrimony" },
  { label: "Occupation Matrimony", href: "/my-home/search/discover-profiles/occupation-matrimony" },
  { label: "Diocese Matrimony", href: "/my-home/search/discover-profiles/diocese-matrimony" },
  { label: "Second Marriage", href: "/my-home/search/discover-profiles/second-marriage-matrimony" },
  { label: "Kannadiga Matrimony", href: "/my-home/search/discover-profiles/kannadiga-matrimony" },
  { label: "Mother Tongue", href: "/my-home/search/discover-profiles/mother-tongue-matrimony" },
  { label: "Community Matrimony", href: "/my-home/search/discover-profiles/community-matrimony" },
  { label: "Hindu Matrimony", href: "/my-home/search/discover-profiles/hindu-matrimony" },
  { label: "Muslim Matrimony", href: "/my-home/search/discover-profiles/muslim-matrimony" },
  { label: "Jain Matrimony", href: "/my-home/search/discover-profiles/jain-matrimony" },
];

interface OtherDirectoriesSectionProps {
  currentCategoryHref: string;
}

export function OtherDirectoriesSection({ currentCategoryHref }: OtherDirectoriesSectionProps) {
  const others = ALL_DIRECTORIES.filter((d) => d.href !== currentCategoryHref).slice(0, 6);

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-foreground mb-3">Other Matrimonial Directories</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {others.map((dir) => (
          <Link
            key={dir.href}
            href={dir.href}
            className="h-10 flex items-center justify-center rounded-lg border border-input text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors"
          >
            {dir.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
