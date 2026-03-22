"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, RefreshCw, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { SaveSearchModal } from "@/components/search/save-search-modal";
import { filtersToSearchParams } from "@/lib/search/url-state";
import type { SavedSearch, SearchFilters } from "@/lib/search/filter-types";

export default function SavedSearchPage() {
  const supabase = createClient();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSearch, setEditSearch] = useState<SavedSearch | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches((data ?? []) as SavedSearch[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("saved_searches").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete.");
    } else {
      setSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success("Search deleted.");
    }
  }

  async function handleRefreshCount(search: SavedSearch) {
    setRefreshingId(search.id);
    // Just update the last_run_at timestamp — actual count would need running the query
    const { error } = await supabase
      .from("saved_searches")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", search.id);
    if (!error) {
      setSearches((prev) => prev.map((s) =>
        s.id === search.id ? { ...s, last_run_at: new Date().toISOString() } : s
      ));
    }
    setRefreshingId(null);
  }

  function handleView(search: SavedSearch) {
    const params = filtersToSearchParams(search.filters);
    router.push(`/my-home/search/partner-search?${params.toString()}`);
  }

  function getFilterTags(filters: SearchFilters): string[] {
    const tags: string[] = [];
    if (filters.min_age || filters.max_age) {
      tags.push(`Age: ${filters.min_age ?? "—"}-${filters.max_age ?? "—"}`);
    }
    if (filters.religion?.length) tags.push(filters.religion.join(", "));
    if (filters.denomination?.length) tags.push(filters.denomination.join(", "));
    if (filters.native_state?.length) tags.push(filters.native_state.join(", "));
    if (filters.native_country?.length) tags.push(filters.native_country.join(", "));
    if (filters.education_level?.length) tags.push(filters.education_level[0] + (filters.education_level.length > 1 ? ` +${filters.education_level.length - 1}` : ""));
    if (filters.occupation_category?.length) tags.push(filters.occupation_category[0] + (filters.occupation_category.length > 1 ? ` +${filters.occupation_category.length - 1}` : ""));
    if (filters.mother_tongue?.length) tags.push(filters.mother_tongue.join(", "));
    return tags;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Saved Searches</span>
      </nav>

      <SearchTabBar />

      <div className="mt-6">
        <h1 className="text-lg font-semibold text-foreground mb-4">Saved Searches</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searches.length === 0 ? (
          <div className="bg-white rounded-lg border border-input p-8 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No saved searches yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Run a partner search and click &ldquo;Save Search&rdquo; to save it
            </p>
            <Link
              href="/my-home/search/partner-search"
              className="inline-flex items-center h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start Searching
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => {
              const tags = getFilterTags(search.filters);
              return (
                <div
                  key={search.id}
                  className="bg-white rounded-lg border border-input p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{search.name}</h3>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tags.slice(0, window.innerWidth < 640 ? 2 : tags.length).map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {window.innerWidth < 640 && tags.length > 2 && (
                            <span className="text-[11px] text-muted-foreground">+{tags.length - 2} more</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span>Saved: {new Date(search.created_at).toLocaleDateString("en-IN")}</span>
                        {search.result_count != null && (
                          <span>{search.result_count} results</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleRefreshCount(search)}
                        disabled={refreshingId === search.id}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors disabled:opacity-50"
                        title="Refresh count"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshingId === search.id ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleView(search)}
                        className="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() => setEditSearch(search)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(search.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editSearch && (
        <SaveSearchModal
          open={true}
          onClose={() => { setEditSearch(null); load(); }}
          filters={editSearch.filters}
          resultCount={editSearch.result_count ?? 0}
          existingId={editSearch.id}
          existingName={editSearch.name}
        />
      )}
    </div>
  );
}
