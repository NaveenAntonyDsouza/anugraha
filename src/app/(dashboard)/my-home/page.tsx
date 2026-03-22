"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileSnapshot } from "@/components/dashboard/profile-snapshot";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { PromoBannerCarousel } from "@/components/dashboard/promo-banner-carousel";
import { ProfileCarouselRow } from "@/components/dashboard/profile-carousel-row";
import { DiscoverProfilesWidget } from "@/components/dashboard/discover-profiles-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import type { ProfileCardData } from "@/components/dashboard/profile-card";

export default function MyHomePage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [newMatches, setNewMatches] = useState<ProfileCardData[]>([]);
  const [mutualMatches, setMutualMatches] = useState<ProfileCardData[]>([]);
  const [recentViews, setRecentViews] = useState<ProfileCardData[]>([]);
  const [newlyJoined, setNewlyJoined] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCarousels = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    const oppositeGender = profile.gender === "Male" ? "Female" : "Male";
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [matchesRes, viewsRes, joinedRes] = await Promise.all([
      // New Matches: opposite gender, active, not self
      supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age, gender, profile_completion_pct")
        .eq("gender", oppositeGender)
        .eq("is_active", true)
        .neq("id", profile.id)
        .order("created_at", { ascending: false })
        .limit(8),
      // Recent Profile Views
      supabase
        .from("profile_views")
        .select("viewer_id, last_viewed_at")
        .eq("viewed_profile_id", profile.id)
        .order("last_viewed_at", { ascending: false })
        .limit(8),
      // Newly Joined (last 7 days)
      supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age, gender, profile_completion_pct")
        .eq("gender", oppositeGender)
        .eq("is_active", true)
        .neq("id", profile.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    // Map to ProfileCardData
    const mapProfile = (p: Record<string, unknown>): ProfileCardData => ({
      id: p.id as string,
      anugraha_id: p.anugraha_id as string,
      full_name: p.full_name as string,
      age: p.age as number,
      photo_url: null,
    });

    if (matchesRes.data) {
      setNewMatches(matchesRes.data.map(mapProfile));
    }

    if (joinedRes.data) {
      setNewlyJoined(joinedRes.data.map(mapProfile));
    }

    // For views, fetch the viewer profiles
    if (viewsRes.data && viewsRes.data.length > 0) {
      const viewerIds = viewsRes.data.map((v) => v.viewer_id);
      const { data: viewers } = await supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age")
        .in("id", viewerIds);
      if (viewers) {
        setRecentViews(viewers.map(mapProfile));
      }
    }

    // Mutual Matches
    const [sentRes, receivedRes] = await Promise.all([
      supabase
        .from("interest_messages")
        .select("receiver_id")
        .eq("sender_id", profile.id)
        .eq("is_deleted_by_sender", false),
      supabase
        .from("interest_messages")
        .select("sender_id")
        .eq("receiver_id", profile.id)
        .eq("is_deleted_by_receiver", false),
    ]);

    if (sentRes.data && receivedRes.data) {
      const sentIds = sentRes.data.map((r) => r.receiver_id);
      const receivedIds = receivedRes.data.map((r) => r.sender_id);
      const mutualIds = sentIds.filter((id) => receivedIds.includes(id));

      if (mutualIds.length > 0) {
        const { data: mutualProfiles } = await supabase
          .from("profiles")
          .select("id, anugraha_id, full_name, age")
          .in("id", mutualIds.slice(0, 8));
        if (mutualProfiles) {
          setMutualMatches(mutualProfiles.map(mapProfile));
        }
      }
    }

    // Load profile photos for all card profiles
    const allProfileIds = [
      ...(matchesRes.data ?? []).map((p) => p.id),
      ...(joinedRes.data ?? []).map((p) => p.id),
    ];
    if (allProfileIds.length > 0) {
      const { data: photos } = await supabase
        .from("profile_photos")
        .select("profile_id, photo_url")
        .in("profile_id", allProfileIds)
        .eq("photo_type", "profile")
        .eq("is_visible", true);
      if (photos) {
        const photoMap = new Map(photos.map((p) => [p.profile_id, p.photo_url]));
        setNewMatches((prev) =>
          prev.map((p) => ({ ...p, photo_url: photoMap.get(p.id) ?? null }))
        );
        setNewlyJoined((prev) =>
          prev.map((p) => ({ ...p, photo_url: photoMap.get(p.id) ?? null }))
        );
      }
    }

    setLoading(false);
  }, [profile, supabase]);

  useEffect(() => {
    loadCarousels();
  }, [loadCarousels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Profile Snapshot */}
      <ProfileSnapshot />

      {/* 2. Stats Bar */}
      <StatsBar />

      {/* 3. Promo Banners */}
      <PromoBannerCarousel />

      {/* 4. New Matches */}
      <ProfileCarouselRow
        title="New Matches"
        seeAllHref="/user-info/my-matches"
        profiles={newMatches}
        emptyText="No new matches found."
      />

      {/* 5. Mutual Matches */}
      <ProfileCarouselRow
        title="Mutual Matches"
        seeAllHref="/user-info/mutual-matches"
        profiles={mutualMatches}
        emptyText="No mutual matches yet."
      />

      {/* 6. Recent Profile Views */}
      <ProfileCarouselRow
        title="Recent Profile Views"
        seeAllHref="/my-home/views?tab=profiles-viewed-by-others"
        profiles={recentViews}
        emptyText="No profile views yet."
      />

      {/* 7. Newly Joined */}
      <ProfileCarouselRow
        title="Newly Joined Profiles"
        seeAllHref="/my-home/search/newly-joined"
        profiles={newlyJoined}
        emptyText="No newly joined profiles."
      />

      {/* 8. Discover Profiles */}
      <DiscoverProfilesWidget />

      {/* 9. Quick Actions */}
      <QuickActions />

      {/* 10. Recent Activity */}
      <ActivityFeed />
    </div>
  );
}
