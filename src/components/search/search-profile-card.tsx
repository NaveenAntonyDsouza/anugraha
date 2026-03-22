"use client";

// Simplified SearchProfileCard for Slice 5
// The authoritative version with all photo states, modals, and three-dots menu
// is defined in Slice 6 and will replace this file.

import Link from "next/link";
import { Heart, Send, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { SearchProfileResult } from "@/lib/search/filter-types";
import { cn } from "@/lib/utils";
import { SendInterestModal } from "@/components/communication/send-interest-modal";
import { checkExistingInterest, sendInterest, formatDateShort } from "@/lib/interest-messages";
import { getDailyUsage, getRemainingColor } from "@/lib/daily-interest-limit";

interface SearchProfileCardProps {
  profile: SearchProfileResult;
  view: "grid" | "list";
}

export function SearchProfileCard({ profile, view }: SearchProfileCardProps) {
  const supabase = createClient();
  const myProfile = useAuthStore((s) => s.profile);
  const [shortlisted, setShortlisted] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestRemaining, setInterestRemaining] = useState(5);

  const photo = profile.profile_photos?.find((p) => p.is_primary) ?? profile.profile_photos?.[0];
  const photoCount = profile.profile_photos?.length ?? 0;

  const info = [
    profile.age ? `${profile.age} Yrs` : null,
    profile.profile_primary_info?.height ?? null,
    profile.profile_primary_info?.complexion ?? null,
    profile.profile_primary_info?.marital_status ?? null,
    profile.profile_religious_info?.denomination ?? null,
    profile.profile_education_profession?.education_level ?? null,
    profile.profile_education_profession?.occupation_category ?? null,
    profile.profile_education_profession?.working_district ??
      profile.profile_education_profession?.working_state ??
      profile.profile_education_profession?.working_country ?? null,
  ].filter(Boolean);

  async function handleShortlist() {
    if (!myProfile) return;
    if (shortlisted) {
      await supabase
        .from("shortlists")
        .delete()
        .eq("profile_id", myProfile.id)
        .eq("shortlisted_profile_id", profile.id);
      setShortlisted(false);
      toast.success("Removed from shortlist.");
    } else {
      await supabase.from("shortlists").insert({
        profile_id: myProfile.id,
        shortlisted_profile_id: profile.id,
      });
      setShortlisted(true);
      toast.success("Added to shortlist.");
    }
  }

  async function handleSendInterestClick() {
    if (!myProfile) return;

    const existing = await checkExistingInterest(supabase, myProfile.id, profile.id);
    if (existing) {
      if (existing.status === "sent") {
        toast.info(`Interest already sent on ${formatDateShort(existing.sent_at)}.`);
        return;
      }
      if (existing.status === "accepted") {
        toast.info("This candidate has accepted your interest.");
        return;
      }
      if (existing.status === "cancelled" && existing.can_resend_after && new Date(existing.can_resend_after) > new Date()) {
        toast.info(`You can resend after ${formatDateShort(existing.can_resend_after)}.`);
        return;
      }
    }

    const usage = await getDailyUsage(supabase, myProfile.id);
    setInterestRemaining(usage.remaining);
    if (usage.remaining <= 0) {
      toast.error("Daily interest limit reached. Upgrade to Premium for more.");
      return;
    }

    setShowInterestModal(true);
  }

  async function handleSendInterest(templateId: string, customMessage: string | null) {
    if (!myProfile) return;
    try {
      await sendInterest(supabase, myProfile.id, profile.id, templateId, customMessage, false);
      toast.success("Interest sent successfully!");
      setInterestRemaining((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send interest.";
      toast.error(msg === "DAILY_LIMIT_REACHED" ? "Daily interest limit reached." : msg);
      throw err;
    }
  }

  if (view === "list") {
    return (
      <div className="bg-white rounded-lg border border-input overflow-hidden hover:shadow-sm transition-shadow flex">
        {/* Photo */}
        <Link
          href={`/view-full-profile/${profile.anugraha_id}`}
          className="flex-shrink-0 w-[150px] bg-muted relative"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.photo_url}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center min-h-[120px]">
              <span className="text-3xl font-bold text-muted-foreground/40">
                {profile.full_name?.charAt(0) ?? "?"}
              </span>
            </div>
          )}
          {photoCount > 0 && (
            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              📷 {photoCount}
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/view-full-profile/${profile.anugraha_id}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {profile.anugraha_id}
              </Link>
              {profile.is_premium && (
                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  Premium
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {info.join(", ")}
          </p>

          <p className="text-[11px] text-muted-foreground mt-1">
            Last Login: {new Date(profile.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-2">
            <button
              onClick={handleSendInterestClick}
              disabled={sendingInterest}
              className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              {sendingInterest ? "..." : "Send Interest"}
            </button>
            <button
              onClick={handleShortlist}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
              aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
            >
              <Heart className={cn("h-4 w-4", shortlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg border border-input overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
      <Link href={`/view-full-profile/${profile.anugraha_id}`} className="block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.photo_url}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/40">
                {profile.full_name?.charAt(0) ?? "?"}
              </span>
            </div>
          )}
          {photoCount > 0 && (
            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              📷 {photoCount}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <Link
            href={`/view-full-profile/${profile.anugraha_id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {profile.anugraha_id}
          </Link>
          {profile.is_premium && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Premium
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {info.join(", ")}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-3">
          <button
            onClick={handleSendInterestClick}
            disabled={sendingInterest}
            className="flex-1 h-8 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Send className="h-3 w-3" />
            {sendingInterest ? "..." : "Send Interest"}
          </button>
          <button
            onClick={handleShortlist}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
            aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <Heart className={cn("h-4 w-4", shortlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
          </button>
        </div>
      </div>

      {/* Send Interest Modal */}
      <SendInterestModal
        open={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        profileId={profile.anugraha_id}
        onSend={handleSendInterest}
        isPremium={false}
      />
    </div>
  );
}
