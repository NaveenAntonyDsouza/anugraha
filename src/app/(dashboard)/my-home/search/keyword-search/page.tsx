"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { MultiSelectFilter } from "@/components/search/multi-select-filter";
import { SearchProfileCard } from "@/components/search/search-profile-card";
import { SearchPagination } from "@/components/search/search-pagination";
import { buildKeywordQuery } from "@/lib/search/build-query";
import { filtersFromSearchParams } from "@/lib/search/url-state";
import type { SearchFilters, SearchProfileResult } from "@/lib/search/filter-types";
import {
  maritalStatusList,
  denominationList,
  countryList,
  indianStateList,
  karnatakaDistrictList,
  childrenStatusList,
} from "@/lib/reference-data";
import {
  educationalQualificationsList,
  occupationCategoryList,
  heightList,
} from "@/lib/reference-data";

export default function KeywordSearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <KeywordSearchContent />
    </Suspense>
  );
}

const ageOptions = Array.from({ length: 53 }, (_, i) => String(18 + i));

function KeywordSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const urlFilters = filtersFromSearchParams(searchParams);

  const [keyword, setKeyword] = useState(urlFilters.keyword ?? "");
  const [keywordType, setKeywordType] = useState<"exact" | "any">(urlFilters.keyword_type ?? "any");
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    per_page: 20,
    view: "grid",
    ...urlFilters,
  });
  const [results, setResults] = useState<SearchProfileResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-search if URL has keyword
  useEffect(() => {
    if (urlFilters.keyword && urlFilters.keyword.length >= 3) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch() {
    if (!profile || keyword.length < 3) {
      if (keyword.length > 0 && keyword.length < 3) {
        toast.error("Keyword must be at least 3 characters.");
      }
      return;
    }
    setLoading(true);
    setSearched(true);

    const query = buildKeywordQuery(supabase, keyword, keywordType, filters, profile.id, profile.gender);
    const { data, count, error } = await query;

    if (error) {
      toast.error("Search failed. Please try again.");
      setLoading(false);
      return;
    }

    setResults((data ?? []) as unknown as SearchProfileResult[]);
    setTotalCount(count ?? 0);
    setLoading(false);

    // Update URL
    const params = new URLSearchParams();
    params.set("keyword", keyword);
    params.set("keyword_type", keywordType);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.view !== "grid") params.set("view", filters.view ?? "grid");
    router.replace(`/my-home/search/keyword-search?${params.toString()}`, { scroll: false });
  }

  function handleFilterChange<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
    setTimeout(() => runSearch(), 0);
  }

  const totalPages = Math.ceil(totalCount / (filters.per_page ?? 20));
  const currentView = filters.view ?? "grid";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Keyword Search</span>
      </nav>

      <SearchTabBar />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input p-4 space-y-4 sticky top-28">
            {/* Keyword Input */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Enter Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Min 3 characters"
                className="w-full h-9 border border-input rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>

            {/* Search Type */}
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="keyword_type"
                  value="exact"
                  checked={keywordType === "exact"}
                  onChange={() => setKeywordType("exact")}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-xs">Exact Word</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="keyword_type"
                  value="any"
                  checked={keywordType === "any"}
                  onChange={() => setKeywordType("any")}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-xs">Any Word</span>
              </label>
            </div>

            <button
              onClick={runSearch}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              SEARCH
            </button>

            <hr className="border-input" />

            {/* Filter fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Min Age</label>
                  <select
                    value={filters.min_age ?? ""}
                    onChange={(e) => handleFilterChange("min_age", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {ageOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Max Age</label>
                  <select
                    value={filters.max_age ?? ""}
                    onChange={(e) => handleFilterChange("max_age", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {ageOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Min Height</label>
                  <select
                    value={filters.min_height ?? ""}
                    onChange={(e) => handleFilterChange("min_height", e.target.value || undefined)}
                    className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {heightList.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Max Height</label>
                  <select
                    value={filters.max_height ?? ""}
                    onChange={(e) => handleFilterChange("max_height", e.target.value || undefined)}
                    className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {heightList.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <MultiSelectFilter
                label="Denomination"
                options={denominationList}
                selected={filters.denomination ?? []}
                onChange={(v) => handleFilterChange("denomination", v)}
              />
              <MultiSelectFilter
                label="Marital Status"
                options={maritalStatusList}
                selected={filters.marital_status ?? []}
                onChange={(v) => handleFilterChange("marital_status", v)}
              />
              {filters.marital_status?.length && !filters.marital_status.includes("Unmarried") ? (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Children Status</label>
                  <div className="space-y-1">
                    {childrenStatusList.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(filters.children_status ?? []).includes(opt)}
                          onChange={(e) => {
                            const curr = filters.children_status ?? [];
                            handleFilterChange(
                              "children_status",
                              e.target.checked ? [...curr, opt] : curr.filter((v) => v !== opt)
                            );
                          }}
                          className="h-3.5 w-3.5 rounded border-input text-primary"
                        />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              <MultiSelectFilter
                label="Education"
                options={educationalQualificationsList}
                selected={filters.education_level ?? []}
                onChange={(v) => handleFilterChange("education_level", v)}
                searchable
              />
              <MultiSelectFilter
                label="Occupation"
                options={occupationCategoryList}
                selected={filters.occupation_category ?? []}
                onChange={(v) => handleFilterChange("occupation_category", v)}
                searchable
              />
              <MultiSelectFilter
                label="Working Country"
                options={countryList}
                selected={filters.working_country ?? []}
                onChange={(v) => handleFilterChange("working_country", v)}
                searchable
              />
              {filters.working_country?.includes("India") && (
                <>
                  <MultiSelectFilter
                    label="Working State"
                    options={indianStateList}
                    selected={filters.working_state ?? []}
                    onChange={(v) => handleFilterChange("working_state", v)}
                    searchable
                  />
                  {filters.working_state?.includes("Karnataka") && (
                    <MultiSelectFilter
                      label="Working District"
                      options={karnatakaDistrictList}
                      selected={filters.working_district ?? []}
                      onChange={(v) => handleFilterChange("working_district", v)}
                      searchable
                    />
                  )}
                </>
              )}
              <MultiSelectFilter
                label="Native Country"
                options={countryList}
                selected={filters.native_country ?? []}
                onChange={(v) => handleFilterChange("native_country", v)}
                searchable
              />
              {filters.native_country?.includes("India") && (
                <>
                  <MultiSelectFilter
                    label="Native State"
                    options={indianStateList}
                    selected={filters.native_state ?? []}
                    onChange={(v) => handleFilterChange("native_state", v)}
                    searchable
                  />
                  {filters.native_state?.includes("Karnataka") && (
                    <MultiSelectFilter
                      label="Native District"
                      options={karnatakaDistrictList}
                      selected={filters.native_district ?? []}
                      onChange={(v) => handleFilterChange("native_district", v)}
                      searchable
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {searched && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{totalCount}</span> profiles
                  {keyword && <> for &ldquo;<span className="text-foreground">{keyword}</span>&rdquo;</>}
                </p>
                <div className="flex border border-input rounded overflow-hidden">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, view: "grid" }))}
                    className={cn("h-8 w-8 flex items-center justify-center", currentView === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, view: "list" }))}
                    className={cn("h-8 w-8 flex items-center justify-center", currentView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white rounded-lg border border-input p-8 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    No profiles found for &ldquo;{keyword}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground">Try broadening your search</p>
                </div>
              ) : (
                <>
                  <div className={cn(currentView === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex flex-col gap-4")}>
                    {results.map((p) => (
                      <SearchProfileCard key={p.id} profile={p} view={currentView} />
                    ))}
                  </div>
                  <SearchPagination
                    currentPage={filters.page ?? 1}
                    totalPages={totalPages}
                    perPage={filters.per_page ?? 20}
                    onPageChange={handlePageChange}
                    onPerPageChange={(pp) => setFilters((p) => ({ ...p, per_page: pp, page: 1 }))}
                  />
                </>
              )}
            </>
          )}

          {!searched && (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Keyword Search</p>
              <p className="text-xs text-muted-foreground">Enter a keyword to search profiles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
