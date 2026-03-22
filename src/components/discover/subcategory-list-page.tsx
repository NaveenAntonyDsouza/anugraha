"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { AdBanner } from "./ad-banner";
import { OtherDirectoriesSection } from "./other-directories-section";

interface SubcategoryListPageProps {
  title: string;
  subcategories: { label: string; href: string }[];
  showSearch?: boolean;
  currentCategoryHref: string;
}

export function SubcategoryListPage({
  title,
  subcategories,
  showSearch = false,
  currentCategoryHref,
}: SubcategoryListPageProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? subcategories.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    : subcategories;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/my-home/search/discover-profiles" className="hover:text-primary">Discover Profiles</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      <SearchTabBar />

      <div className="flex gap-6 mt-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {showSearch && (
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-9 pl-9 pr-3 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-input divide-y divide-input">
            {filtered.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            ) : (
              filtered.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-primary/5 transition-colors"
                >
                  <span>{sub.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>

          <OtherDirectoriesSection currentCategoryHref={currentCategoryHref} />
        </div>

        {/* Ad Banner */}
        <AdBanner />
      </div>
    </div>
  );
}
