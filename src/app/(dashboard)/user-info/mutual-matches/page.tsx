"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileCard, type ProfileCardData } from "@/components/dashboard/profile-card";

export default function MutualMatchesPage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    setLoading(true);

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

    const sentIds = (sentRes.data ?? []).map((r: any) => r.receiver_id);
    const receivedIds = (receivedRes.data ?? []).map((r: any) => r.sender_id);
    const mutualIds = sentIds.filter((id: any) => receivedIds.includes(id));

    if (mutualIds.length > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age")
        .in("id", mutualIds);

      const mapped: ProfileCardData[] = (data ?? []).map((p: any) => ({
        id: p.id,
        anugraha_id: p.anugraha_id,
        full_name: p.full_name,
        age: p.age,
        photo_url: null,
      }));

      if (mapped.length > 0) {
        const ids = mapped.map((p: any) => p.id);
        const { data: photos } = await supabase
          .from("profile_photos")
          .select("profile_id, photo_url")
          .in("profile_id", ids)
          .eq("photo_type", "profile")
          .eq("is_visible", true);
        if (photos) {
          const photoMap = new Map(photos.map((p: any) => [p.profile_id, p.photo_url]));
          mapped.forEach((p: any) => { p.photo_url = photoMap.get(p.id) ?? null; });
        }
      }

      setProfiles(mapped);
    }

    setLoading(false);
  }, [profile, authLoading, supabase]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Mutual Matches</span>
      </nav>

      <h1 className="text-lg font-semibold text-foreground mb-4">Mutual Matches</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-lg border border-input p-8 text-center">
          <p className="text-sm text-muted-foreground">No mutual matches yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
