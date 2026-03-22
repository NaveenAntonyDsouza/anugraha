"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Grid, List, Save, Search, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { SearchProfileCard } from "@/components/search/search-profile-card";
import { SearchPagination } from "@/components/search/search-pagination";
import { SaveSearchModal } from "@/components/search/save-search-modal";
import { AdBanner } from "./ad-banner";
import type { SearchProfileResult, SearchFilters } from "@/lib/search/filter-types";

interface Breadcrumb {
  label: string;
  href: string;
}

interface CategoryResultsPageProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: (supabase: ReturnType<typeof createClient>, profileId: string, gender: string, from: number, to: number) => any;
  categoryHref: string;
  filters?: Partial<SearchFilters>;
}

export function CategoryResultsPage({
  title,
  breadcrumbs,
  queryFn,
  categoryHref,
  filters: presetFilters,
}: CategoryResultsPageProps) {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [results, setResults] = useState<SearchProfileResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("last_active");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    const oppositeGender = profile.gender === "Male" ? "Female" : "Male";
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const query = queryFn(supabase, profile.id, oppositeGender, from, to);
    const { data, count, error } = await (query as unknown as Promise<{ data: unknown[]; count: number | null; error: unknown }>);

    if (error) {
      toast.error("Failed to load profiles.");
      setLoading(false);
      return;
    }

    setResults((data ?? []) as unknown as SearchProfileResult[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [profile, page, perPage, supabase, queryFn]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href}>
            {i > 0 && <span className="mx-1.5">/</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-primary">{crumb.label}</Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <SearchTabBar />

      <div className="flex gap-6 mt-6">
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount} Matching profiles found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border border-input rounded overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={cn("h-8 w-8 flex items-center justify-center", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cn("h-8 w-8 flex items-center justify-center", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-8 border border-input rounded px-2 text-xs bg-white"
              >
                <option value="last_active">Last Login</option>
                <option value="newest">Newest</option>
                <option value="relevance">Relevance</option>
              </select>

              <button
                onClick={() => setShowSaveModal(true)}
                className="h-8 px-2 flex items-center gap-1 text-xs text-primary border border-primary/30 rounded hover:bg-primary/5"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>

              <Link
                href={categoryHref}
                className="h-8 px-2 flex items-center gap-1 text-xs border border-input rounded text-muted-foreground hover:bg-muted/50"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Category
              </Link>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Sorry!</p>
              <p className="text-xs text-muted-foreground">
                No matching profiles found based on your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className={cn(
                view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex flex-col gap-4"
              )}>
                {results.map((p) => (
                  <SearchProfileCard key={p.id} profile={p} view={view} />
                ))}
              </div>

              <SearchPagination
                currentPage={page}
                totalPages={totalPages}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
              />
            </>
          )}
        </div>

        <AdBanner />
      </div>

      <SaveSearchModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        filters={presetFilters ?? {}}
        resultCount={totalCount}
      />
    </div>
  );
}
