"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { ProfileCard, type ProfileCardData } from "@/components/dashboard/profile-card";

export default function HighlightedProfilesPage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<"Bride" | "Groom">("Bride");

  const load = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    setLoading(true);

    const targetGender = genderFilter === "Bride" ? "Female" : "Male";

    // Fetch profiles that have active highlight add-on
    // For now, since add-ons table may not exist yet, show premium profiles as featured
    const { data: memberships } = await supabase
      .from("user_memberships")
      .select("user_id")
      .eq("is_active", true);

    const premiumUserIds = (memberships ?? []).map((m) => m.user_id);
    if (premiumUserIds.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, anugraha_id, full_name, age, user_id")
      .in("user_id", premiumUserIds)
      .eq("gender", targetGender)
      .eq("is_active", true)
      .is("deleted_at", null)
      .neq("id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(40);

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

    setProfiles(mapped);
    setLoading(false);
  }, [profile, authLoading, genderFilter, supabase]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Highlighted Profiles</span>
      </nav>

      <SearchTabBar />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Highlighted Profiles
          </h1>
          <div className="flex border border-input rounded-lg overflow-hidden">
            <button
              onClick={() => setGenderFilter("Bride")}
              className={`px-4 py-2 text-sm font-medium ${genderFilter === "Bride" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Brides
            </button>
            <button
              onClick={() => setGenderFilter("Groom")}
              className={`px-4 py-2 text-sm font-medium ${genderFilter === "Groom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Grooms
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-lg border border-input p-8 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No highlighted profiles at the moment</p>
            <p className="text-xs text-muted-foreground">Check back later for featured profiles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                extra={
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-primary font-medium">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
