"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "./stat-card";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const STAT_CONFIG = [
  { id: "interest_message_sent", label: "Interest Message", href: "/user-info/interest-message?tab=sent" },
  { id: "interest_accepted", label: "Interest Accepted", href: "/user-info/interest-message?tab=sent&filter=accepted_me" },
  { id: "profile_views", label: "Profile Views", href: "/my-home/views?tab=profiles-viewed-by-others" },
  { id: "contact_views", label: "Contact Views", href: "/my-home/views?tab=contacts-viewed-by-others" },
  { id: "shortlisted", label: "Shortlisted", href: "/my-home/lists?section=shortlisted" },
] as const;

export function StatsBar() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadCounts = useCallback(async () => {
    if (!profile || !user) return;

    const [msgSent, msgAccepted, profileViews, shortlisted, membership] = await Promise.all([
      supabase
        .from("interest_messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", profile.id)
        .eq("is_deleted_by_sender", false),
      supabase
        .from("interest_messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", profile.id)
        .eq("status", "accepted"),
      supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewed_profile_id", profile.id),
      supabase
        .from("shortlists")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile.id),
      supabase
        .from("user_memberships")
        .select("contacts_viewed")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single(),
    ]);

    setCounts({
      interest_message_sent: msgSent.count ?? 0,
      interest_accepted: msgAccepted.count ?? 0,
      profile_views: profileViews.count ?? 0,
      contact_views: membership.data?.contacts_viewed ?? 0,
      shortlisted: shortlisted.count ?? 0,
    });
  }, [profile, user, supabase]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STAT_CONFIG.map((stat) => (
        <StatCard
          key={stat.id}
          label={stat.label}
          count={counts[stat.id] ?? 0}
          href={stat.href}
        />
      ))}
    </div>
  );
}
