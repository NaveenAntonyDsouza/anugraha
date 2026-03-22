"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TABS,
  FILTERS,
  buildInterestQuery,
  type InterestMessage,
  type TabId,
  type FilterId,
} from "@/lib/interest-messages";
import { InterestFilterSidebar } from "./interest-filter-sidebar";
import { InterestTable, InterestCardList } from "./interest-table";
import { TrashConfirmModal } from "./cancel-confirm-modal";
import { RealtimeBanner } from "./realtime-banner";

export function InterestListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "all"
  );
  const [activeFilter, setActiveFilter] = useState<FilterId | null>(
    (searchParams.get("filter") as FilterId) || null
  );
  const [interests, setInterests] = useState<InterestMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchId, setSearchId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});
  const [showTrashModal, setShowTrashModal] = useState(false);

  const myProfileId = profile?.id;

  // Update URL when tab/filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (activeFilter) params.set("filter", activeFilter);
    router.replace(`/user-info/interest-message?${params.toString()}`, { scroll: false });
  }, [activeTab, activeFilter, router]);

  // Fetch interests
  const fetchInterests = useCallback(async () => {
    if (!myProfileId) return;
    setLoading(true);

    try {
      const query = buildInterestQuery(
        supabase,
        myProfileId,
        activeTab,
        activeFilter,
        page,
        pageSize,
        searchId
      );

      const { data, count, error } = await query;
      if (error) throw error;

      let results = (data ?? []) as unknown as InterestMessage[];

      // For "all" tab, filter out items deleted by current user
      if (activeTab === "all") {
        results = results.filter((i) => {
          if (i.sender_id === myProfileId) return !i.is_deleted_by_sender;
          if (i.receiver_id === myProfileId) return !i.is_deleted_by_receiver;
          return true;
        });
      }

      // Client-side search filter by anugraha_id
      if (searchId.trim()) {
        const q = searchId.trim().toUpperCase();
        results = results.filter((i) => {
          const other = i.sender_id === myProfileId ? i.receiver : i.sender;
          return other.anugraha_id.toUpperCase().includes(q);
        });
      }

      setInterests(results);
      setTotalCount(count ?? results.length);
    } catch {
      toast.error("Failed to load interest messages");
    } finally {
      setLoading(false);
    }
  }, [myProfileId, activeTab, activeFilter, page, pageSize, searchId, supabase]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  // Load filter counts
  useEffect(() => {
    if (!myProfileId) return;

    async function loadCounts() {
      const counts: Record<string, number> = {};

      const queries = FILTERS.map(async (f) => {
        const q = buildInterestQuery(supabase, myProfileId!, activeTab, f.id, 1, 1);
        const { count } = await q;
        counts[f.id] = count ?? 0;
      });

      await Promise.all(queries);
      setFilterCounts(counts);
    }

    loadCounts();
  }, [myProfileId, activeTab, supabase]);

  // Tab change
  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    setActiveFilter(null);
    setPage(1);
    setSelectedIds(new Set());
  }

  // Filter change
  function handleFilterChange(filter: FilterId | null) {
    setActiveFilter(filter);
    setPage(1);
    setSelectedIds(new Set());
  }

  // Search
  function handleSearch() {
    setSearchId(searchInput);
    setActiveFilter(null);
    setPage(1);
  }

  // Star toggle
  async function handleStarToggle(interest: InterestMessage) {
    if (!myProfileId) return;
    const role = interest.sender_id === myProfileId ? "sender" : "receiver";
    const field = role === "sender" ? "is_starred_by_sender" : "is_starred_by_receiver";
    const currentVal = role === "sender" ? interest.is_starred_by_sender : interest.is_starred_by_receiver;

    // Optimistic update
    setInterests((prev) =>
      prev.map((i) => (i.id === interest.id ? { ...i, [field]: !currentVal } : i))
    );

    const { error } = await supabase
      .from("interest_messages")
      .update({ [field]: !currentVal })
      .eq("id", interest.id);

    if (error) {
      setInterests((prev) =>
        prev.map((i) => (i.id === interest.id ? { ...i, [field]: currentVal } : i))
      );
      toast.error("Failed to update star");
    } else {
      toast.success(currentVal ? "Unstarred" : "Starred");
    }
  }

  // Mark as read
  async function handleMarkRead(interest: InterestMessage) {
    if (interest.is_read) return;
    setInterests((prev) =>
      prev.map((i) => (i.id === interest.id ? { ...i, is_read: true } : i))
    );
    await supabase
      .from("interest_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", interest.id);
  }

  // Selection
  function handleSelectToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(interests.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  // Bulk trash/delete
  async function handleBulkTrash() {
    if (!myProfileId || selectedIds.size === 0) return;
    const isPermanent = activeTab === "trash";

    if (isPermanent) {
      // Permanent delete
      const { error } = await supabase
        .from("interest_messages")
        .delete()
        .in("id", Array.from(selectedIds));
      if (error) throw error;
    } else {
      // Move to trash (set is_deleted flag per role)
      for (const id of selectedIds) {
        const interest = interests.find((i) => i.id === id);
        if (!interest) continue;
        const role = interest.sender_id === myProfileId ? "sender" : "receiver";
        const field = role === "sender" ? "is_deleted_by_sender" : "is_deleted_by_receiver";
        await supabase
          .from("interest_messages")
          .update({ [field]: true })
          .eq("id", id);
      }
    }

    toast.success(
      isPermanent
        ? "Messages deleted permanently"
        : "You have successfully trashed the message"
    );
    setSelectedIds(new Set());
    fetchInterests();
  }

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <a href="/my-home" className="hover:text-foreground">My Home</a>
        <span className="mx-1">/</span>
        <span className="text-foreground">Interest Messages</span>
      </nav>

      {/* Realtime banner */}
      {myProfileId && (
        <RealtimeBanner profileId={myProfileId} onRefresh={fetchInterests} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:block w-56 shrink-0">
          <InterestFilterSidebar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            filterCounts={filterCounts}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <Input
                placeholder="Enter Anugraha ID"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-9"
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter dropdown (mobile + mirrors sidebar) */}
            <div className="lg:hidden">
              <Select
                value={activeFilter ?? "all"}
                onValueChange={(v) => handleFilterChange(v === "all" ? null : (v as FilterId))}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {FILTERS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} Selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTrashModal(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <InterestTable
                  interests={interests}
                  myProfileId={myProfileId!}
                  currentTab={activeTab}
                  currentFilter={activeFilter}
                  selectedIds={selectedIds}
                  onSelectToggle={handleSelectToggle}
                  onSelectAll={handleSelectAll}
                  onStarToggle={handleStarToggle}
                  onMarkRead={handleMarkRead}
                />
              </div>

              {/* Mobile cards */}
              <InterestCardList
                interests={interests}
                myProfileId={myProfileId!}
                currentTab={activeTab}
                currentFilter={activeFilter}
                onStarToggle={handleStarToggle}
                onMarkRead={handleMarkRead}
              />

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Messages Per Page</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {from}-{to} of {totalCount}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      &lt;
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Trash modal */}
      <TrashConfirmModal
        open={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        onConfirm={handleBulkTrash}
        isPermanent={activeTab === "trash"}
      />
    </div>
  );
}
