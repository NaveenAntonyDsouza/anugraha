"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileSnapshot() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [completionPct, setCompletionPct] = useState(0);
  const [membershipPlan, setMembershipPlan] = useState("Free");
  const [location, setLocation] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile || !user) return;

    const [photoRes, locRes, membershipRes] = await Promise.all([
      supabase
        .from("profile_photos")
        .select("photo_url")
        .eq("profile_id", profile.id)
        .eq("photo_type", "profile")
        .eq("is_visible", true)
        .limit(1)
        .single(),
      supabase
        .from("profile_location_info")
        .select("native_state, native_district")
        .eq("profile_id", profile.id)
        .single(),
      supabase
        .from("user_memberships")
        .select("plan_name")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single(),
    ]);

    if (photoRes.data) setPhotoUrl(photoRes.data.photo_url);
    setCompletionPct(profile.profile_completion_pct ?? 0);
    if (locRes.data) {
      const parts = [locRes.data.native_district, locRes.data.native_state].filter(Boolean);
      setLocation(parts.join(", ") || null);
    }
    if (membershipRes.data) setMembershipPlan(membershipRes.data.plan_name ?? "Free");
  }, [profile, user, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  if (!profile) return null;

  const pctColor =
    completionPct >= 80 ? "bg-emerald-500" : completionPct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-white rounded-lg border border-input p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={profile.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {profile.full_name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">{profile.full_name}</h2>
              <p className="text-xs text-muted-foreground">
                {profile.anugraha_id} · {profile.age} yrs
                {location && ` · ${location}`}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary flex-shrink-0">
              {membershipPlan}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Profile Completion
              </span>
              <span className={cn("text-xs font-medium", completionPct >= 80 ? "text-emerald-600" : completionPct >= 50 ? "text-amber-600" : "text-red-600")}>
                {completionPct}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", pctColor)}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {completionPct < 100 && (
              <Link
                href="/my-home/view-and-edit"
                className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors inline-flex items-center"
              >
                Complete Profile
              </Link>
            )}
            {membershipPlan === "Free" && (
              <Link
                href="/membership-plans"
                className="h-8 px-4 border border-primary text-primary rounded-lg text-xs font-medium hover:bg-primary/5 transition-colors inline-flex items-center"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
