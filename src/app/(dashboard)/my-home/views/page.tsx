"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileCard, type ProfileCardData } from "@/components/dashboard/profile-card";

type ViewTab =
  | "profiles-viewed-by-others"
  | "profiles-viewed-by-me"
  | "contacts-viewed-by-others"
  | "contacts-viewed-by-me";

const TABS: { key: ViewTab; label: string; group: string; icon: typeof Eye }[] = [
  { key: "profiles-viewed-by-others", label: "Viewed By Others", group: "Profile Views", icon: Eye },
  { key: "profiles-viewed-by-me", label: "Viewed By Me", group: "Profile Views", icon: Eye },
  { key: "contacts-viewed-by-others", label: "Viewed By Others", group: "Contact Views", icon: Smartphone },
  { key: "contacts-viewed-by-me", label: "Viewed By Me", group: "Contact Views", icon: Smartphone },
];

export default function ViewsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ViewsContent />
    </Suspense>
  );
}

function ViewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const activeTab = (searchParams.get("tab") as ViewTab) || "profiles-viewed-by-others";
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<ViewTab, number>>({
    "profiles-viewed-by-others": 0,
    "profiles-viewed-by-me": 0,
    "contacts-viewed-by-others": 0,
    "contacts-viewed-by-me": 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadCounts = useCallback(async () => {
    if (!profile || !user) { if (!authLoading) setLoading(false); return; }
    const [viewedByOthers, viewedByMe, membership] = await Promise.all([
      supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewed_profile_id", profile.id),
      supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewer_id", profile.id),
      supabase
        .from("user_memberships")
        .select("contacts_viewed")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single(),
    ]);
    setCounts({
      "profiles-viewed-by-others": viewedByOthers.count ?? 0,
      "profiles-viewed-by-me": viewedByMe.count ?? 0,
      "contacts-viewed-by-others": membership.data?.contacts_viewed ?? 0,
      "contacts-viewed-by-me": 0,
    });
  }, [profile, authLoading, user, supabase]);

  const loadProfiles = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    setLoading(true);
    const perPage = 20;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let profileIds: string[] = [];

    if (activeTab === "profiles-viewed-by-others") {
      const { data } = await supabase
        .from("profile_views")
        .select("viewer_id")
        .eq("viewed_profile_id", profile.id)
        .order("last_viewed_at", { ascending: false })
        .range(from, to);
      profileIds = data?.map((v: any) => v.viewer_id) ?? [];
      setHasMore((data?.length ?? 0) === perPage);
    } else if (activeTab === "profiles-viewed-by-me") {
      const { data } = await supabase
        .from("profile_views")
        .select("viewed_profile_id")
        .eq("viewer_id", profile.id)
        .order("last_viewed_at", { ascending: false })
        .range(from, to);
      profileIds = data?.map((v: any) => v.viewed_profile_id) ?? [];
      setHasMore((data?.length ?? 0) === perPage);
    }

    if (profileIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age")
        .in("id", profileIds);

      const mapped: ProfileCardData[] = (profilesData ?? []).map((p: any) => ({
        id: p.id,
        anugraha_id: p.anugraha_id,
        full_name: p.full_name,
        age: p.age,
        photo_url: null,
      }));

      const { data: photos } = await supabase
        .from("profile_photos")
        .select("profile_id, photo_url")
        .in("profile_id", profileIds)
        .eq("photo_type", "profile")
        .eq("is_visible", true);

      if (photos) {
        const photoMap = new Map(photos.map((p: any) => [p.profile_id, p.photo_url]));
        mapped.forEach((p: any) => {
          p.photo_url = photoMap.get(p.id) ?? null;
        });
      }

      setProfiles((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
    } else {
      if (page === 1) setProfiles([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [profile, authLoading, activeTab, page, supabase]);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { setPage(1); setProfiles([]); }, [activeTab]);
  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  function switchTab(tab: ViewTab) {
    router.push(`/my-home/views?tab=${tab}`);
  }

  const groups = Array.from(new Set(TABS.map((t) => t.group)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Views</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-[220px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input sticky top-20">
            {groups.map((group) => (
              <div key={group}>
                <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <nav className="pb-2">
                  {TABS.filter((t) => t.group === group).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => switchTab(tab.key)}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors",
                        activeTab === tab.key
                          ? "text-primary bg-primary/5 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <tab.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs">{tab.label}</span>
                      </div>
                      <span className="text-xs font-medium">{counts[tab.key]}</span>
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground mb-4">
            {TABS.find((t) => t.key === activeTab)?.group} — {TABS.find((t) => t.key === activeTab)?.label}
          </h1>

          {activeTab === "contacts-viewed-by-others" || activeTab === "contacts-viewed-by-me" ? (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <Smartphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                {activeTab === "contacts-viewed-by-others"
                  ? `${counts["contacts-viewed-by-others"]} people have viewed your contact info.`
                  : "You haven't viewed any contact details yet."}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Contact view details are available on premium.
              </p>
              <Link
                href="/membership-plans"
                className="inline-flex items-center h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          ) : loading && page === 1 ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                {activeTab === "profiles-viewed-by-others"
                  ? "No one has viewed your profile yet"
                  : "You haven't viewed any profiles yet"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {activeTab === "profiles-viewed-by-others"
                  ? "Complete your profile to get more views"
                  : "Start searching for your perfect match"}
              </p>
              <Link
                href={activeTab === "profiles-viewed-by-others" ? "/my-home/view-and-edit" : "/my-home/search/partner-search"}
                className="inline-flex items-center h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {activeTab === "profiles-viewed-by-others" ? "Complete Profile" : "Start Searching"}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
