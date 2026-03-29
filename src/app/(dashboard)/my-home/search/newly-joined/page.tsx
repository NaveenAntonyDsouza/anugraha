"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileCard, type ProfileCardData } from "@/components/dashboard/profile-card";

export default function NewlyJoinedPage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const load = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    setLoading(true);

    const oppositeGender = profile.gender === "Male" ? "Female" : "Male";
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const perPage = 20;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data } = await supabase
      .from("profiles")
      .select("id, anugraha_id, full_name, age")
      .eq("gender", oppositeGender)
      .eq("is_active", true)
      .neq("id", profile.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: sort === "oldest" })
      .range(from, to);

    const mapped: ProfileCardData[] = (data ?? []).map((p) => ({
      id: p.id,
      anugraha_id: p.anugraha_id,
      full_name: p.full_name,
      age: p.age,
      photo_url: null,
    }));

    if (mapped.length > 0) {
      const ids = mapped.map((p) => p.id);
      const { data: photos } = await supabase
        .from("profile_photos")
        .select("profile_id, photo_url")
        .in("profile_id", ids)
        .eq("photo_type", "profile")
        .eq("is_visible", true);
      if (photos) {
        const photoMap = new Map(photos.map((p) => [p.profile_id, p.photo_url]));
        mapped.forEach((p) => { p.photo_url = photoMap.get(p.id) ?? null; });
      }
    }

    setHasMore((data?.length ?? 0) === perPage);
    setProfiles((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
    setLoading(false);
  }, [profile, authLoading, page, sort, supabase]);

  useEffect(() => { setPage(1); setProfiles([]); }, [sort]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Newly Joined Profiles</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-foreground">Newly Joined Profiles</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="h-9 border border-input rounded-lg px-3 text-sm bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-lg border border-input p-8 text-center">
          <p className="text-sm text-muted-foreground">No newly joined profiles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {profiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
