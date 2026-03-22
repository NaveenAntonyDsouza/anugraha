"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, List, Save, SlidersHorizontal, X, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useSearchStore } from "@/stores/search-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { SearchProfileCard } from "@/components/search/search-profile-card";
import { SearchPagination } from "@/components/search/search-pagination";
import { SaveSearchModal } from "@/components/search/save-search-modal";
import { buildSearchQuery } from "@/lib/search/build-query";
import { applyShowProfileFilters } from "@/lib/search/apply-show-profile-filters";
import { applyVisibilityFilters } from "@/lib/search/apply-visibility-filters";
import { filtersFromSearchParams, filtersToSearchParams, hasActiveFilters } from "@/lib/search/url-state";
import { togglesFromSearchParams } from "@/lib/search/url-state";
import type { SearchFilters, SearchProfileResult, ShowProfileToggles } from "@/lib/search/filter-types";
import { DEFAULT_SHOW_PROFILE_TOGGLES } from "@/lib/search/filter-types";

export default function PartnerSearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PartnerSearchContent />
    </Suspense>
  );
}

function PartnerSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  // Parse filters from URL
  const urlFilters = filtersFromSearchParams(searchParams);
  const urlToggles = togglesFromSearchParams(searchParams);

  const [filters, setFilters] = useState<SearchFilters>({
    sort: "last_active",
    page: 1,
    per_page: 20,
    view: "grid",
    ...urlFilters,
  });
  const [toggles, setToggles] = useState<ShowProfileToggles>({ ...DEFAULT_SHOW_PROFILE_TOGGLES, ...urlToggles });

  const [results, setResults] = useState<SearchProfileResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // User interaction data for "Show Profile" filters
  const [interactionData, setInteractionData] = useState({
    viewedIds: [] as string[],
    contactedIds: [] as string[],
    sentInterestIds: [] as string[],
    shortlistedIds: [] as string[],
  });

  // Load user interaction data once
  useEffect(() => {
    if (!profile) return;
    async function loadInteractions() {
      const [views, interests, shortlists] = await Promise.all([
        supabase.from("profile_views").select("viewed_profile_id").eq("viewer_id", profile!.id),
        supabase.from("interest_messages").select("receiver_id").eq("sender_id", profile!.id),
        supabase.from("shortlists").select("shortlisted_profile_id").eq("profile_id", profile!.id),
      ]);
      setInteractionData({
        viewedIds: (views.data ?? []).map((v) => v.viewed_profile_id),
        contactedIds: [],
        sentInterestIds: (interests.data ?? []).map((v) => v.receiver_id),
        shortlistedIds: (shortlists.data ?? []).map((v) => v.shortlisted_profile_id),
      });
    }
    loadInteractions();
  }, [profile, supabase]);

  // If URL has filters on mount, run search immediately
  useEffect(() => {
    if (hasActiveFilters(urlFilters)) {
      runSearch(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(searchFilters?: SearchFilters) {
    if (!profile) return;
    const f = searchFilters ?? filters;
    setLoading(true);
    setSearched(true);

    const query = buildSearchQuery(supabase, f, profile.id, profile.gender);
    const { data, count, error } = await query;

    if (error) {
      toast.error("Search failed. Please try again.");
      setLoading(false);
      return;
    }

    let profiles = (data ?? []) as unknown as SearchProfileResult[];
    const rawCount = count ?? 0;

    // Fetch privacy settings for the result user_ids
    if (profiles.length > 0) {
      const userIds = profiles.map((p) => p.user_id);
      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("user_id, show_outside_age_norm, show_outside_height_norm, show_outside_religion, show_outside_caste, hide_from_search")
        .in("user_id", userIds);

      if (privacyData) {
        const psMap = new Map(privacyData.map((ps) => [ps.user_id, ps]));
        profiles = profiles.map((p) => ({
          ...p,
          privacy_settings: psMap.get(p.user_id) ?? null,
        }));
      }

      // Fetch membership status
      const { data: memberships } = await supabase
        .from("user_memberships")
        .select("user_id")
        .in("user_id", userIds)
        .eq("is_active", true);

      if (memberships) {
        const premiumSet = new Set(memberships.map((m) => m.user_id));
        profiles = profiles.map((p) => ({
          ...p,
          is_premium: premiumSet.has(p.user_id),
        }));
      }

      // Apply visibility filters (respect target's privacy settings)
      const myInfo = await loadCurrentProfileContext();
      if (myInfo) {
        profiles = applyVisibilityFilters(profiles, myInfo);
      }

      // Apply "Show Profile" client-side toggles
      profiles = applyShowProfileFilters(profiles, toggles, interactionData);
    }

    setResults(profiles);
    setTotalCount(rawCount);
    setLoading(false);

    // Update URL with current filters
    const params = filtersToSearchParams(f, toggles);
    router.replace(`/my-home/search/partner-search?${params.toString()}`, { scroll: false });
  }

  async function loadCurrentProfileContext() {
    if (!profile) return null;
    const [primaryRes, religiousRes] = await Promise.all([
      supabase.from("profile_primary_info").select("height").eq("profile_id", profile.id).single(),
      supabase.from("profile_religious_info").select("religion, caste_community").eq("profile_id", profile.id).single(),
    ]);
    return {
      age: profile.age,
      gender: profile.gender,
      height: primaryRes.data?.height ?? null,
      religion: religiousRes.data?.religion ?? null,
      caste_community: religiousRes.data?.caste_community ?? null,
    };
  }

  function handleFilterChange<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleChange(key: keyof ShowProfileToggles, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setFilters({ sort: "last_active", page: 1, per_page: 20, view: "grid" });
    setToggles({ ...DEFAULT_SHOW_PROFILE_TOGGLES });
    setResults([]);
    setSearched(false);
    setTotalCount(0);
    router.replace("/my-home/search/partner-search", { scroll: false });
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
    runSearch({ ...filters, page });
  }

  function handlePerPageChange(perPage: number) {
    setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
    runSearch({ ...filters, per_page: perPage, page: 1 });
  }

  function handleSortChange(sort: string) {
    const s = sort as SearchFilters["sort"];
    setFilters((prev) => ({ ...prev, sort: s, page: 1 }));
    runSearch({ ...filters, sort: s, page: 1 });
  }

  function handleViewChange(view: "grid" | "list") {
    setFilters((prev) => ({ ...prev, view }));
    const params = filtersToSearchParams({ ...filters, view }, toggles);
    router.replace(`/my-home/search/partner-search?${params.toString()}`, { scroll: false });
  }

  const totalPages = Math.ceil(totalCount / (filters.per_page ?? 20));
  const currentView = filters.view ?? "grid";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Search</span>
      </nav>

      <SearchTabBar />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Filter Panel - Desktop */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input p-4 sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto">
            <FilterPanel
              filters={filters}
              toggles={toggles}
              onFilterChange={handleFilterChange}
              onToggleChange={handleToggleChange}
              onSearch={() => runSearch()}
              onReset={handleReset}
            />
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="w-full h-10 flex items-center justify-center gap-2 bg-white border border-input rounded-lg text-sm font-medium text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-input">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel
                  filters={filters}
                  toggles={toggles}
                  onFilterChange={handleFilterChange}
                  onToggleChange={handleToggleChange}
                  onSearch={() => { runSearch(); setMobileFilterOpen(false); }}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 min-w-0">
          {searched && (
            <>
              {/* Results Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Found <span className="font-semibold text-foreground">{totalCount}</span> profiles
                  </p>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="h-8 px-3 flex items-center gap-1 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Search
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filters.sort ?? "last_active"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="h-8 border border-input rounded px-2 text-xs bg-white"
                  >
                    <option value="last_active">Last Active</option>
                    <option value="newest">Newest First</option>
                    <option value="relevance">Relevance</option>
                  </select>

                  <div className="flex border border-input rounded overflow-hidden">
                    <button
                      onClick={() => handleViewChange("grid")}
                      className={cn(
                        "h-8 w-8 flex items-center justify-center",
                        currentView === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
                      )}
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleViewChange("list")}
                      className={cn(
                        "h-8 w-8 flex items-center justify-center",
                        currentView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
                      )}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Grid/List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white rounded-lg border border-input p-8 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No profiles found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search filters</p>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      currentView === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                        : "flex flex-col gap-4"
                    )}
                  >
                    {results.map((p) => (
                      <SearchProfileCard key={p.id} profile={p} view={currentView} />
                    ))}
                  </div>

                  <SearchPagination
                    currentPage={filters.page ?? 1}
                    totalPages={totalPages}
                    perPage={filters.per_page ?? 20}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                  />
                </>
              )}
            </>
          )}

          {!searched && (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Partner Search</p>
              <p className="text-xs text-muted-foreground">
                Use the filters on the left to find your perfect match
              </p>
            </div>
          )}
        </div>
      </div>

      <SaveSearchModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        filters={filters}
        resultCount={totalCount}
      />
    </div>
  );
}
