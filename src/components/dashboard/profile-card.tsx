"use client";

import Link from "next/link";
import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface ProfileCardData {
  id: string;
  anugraha_id: string;
  full_name: string;
  age: number;
  photo_url?: string | null;
  location?: string | null;
  denomination?: string | null;
  education?: string | null;
  occupation?: string | null;
}

interface ProfileCardProps {
  profile: ProfileCardData;
  showActions?: boolean;
  extra?: React.ReactNode;
}

export function ProfileCard({ profile, showActions = true, extra }: ProfileCardProps) {
  const supabase = createClient();
  const myProfile = useAuthStore((s) => s.profile);
  const [shortlisted, setShortlisted] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);

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

  async function handleSendInterest() {
    if (!myProfile) return;
    setSendingInterest(true);
    const { error } = await supabase.from("interest_messages").insert({
      sender_id: myProfile.id,
      receiver_id: profile.id,
      message: "I am interested in your profile.",
      status: "sent",
    });
    if (error) {
      if (error.code === "23505") {
        toast.error("Interest already sent to this profile.");
      } else {
        toast.error("Failed to send interest.");
      }
    } else {
      toast.success("Interest sent successfully!");
    }
    setSendingInterest(false);
  }

  return (
    <div className="bg-white rounded-lg border border-input overflow-hidden hover:shadow-sm transition-shadow flex flex-col">
      <Link href={`/view-full-profile/${profile.anugraha_id}`} className="block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo_url}
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
        </div>
      </Link>

      <div className="p-3 flex-1 flex flex-col">
        <Link
          href={`/view-full-profile/${profile.anugraha_id}`}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
        >
          {profile.full_name}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          {profile.anugraha_id} · {profile.age} yrs
        </p>
        {profile.location && (
          <p className="text-xs text-muted-foreground line-clamp-1">{profile.location}</p>
        )}
        {profile.denomination && (
          <p className="text-xs text-muted-foreground line-clamp-1">{profile.denomination}</p>
        )}

        {extra}

        {showActions && (
          <div className="flex items-center gap-2 mt-auto pt-3">
            <button
              onClick={handleSendInterest}
              disabled={sendingInterest}
              className="flex-1 h-8 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Send className="h-3 w-3" />
              {sendingInterest ? "Sending..." : "Send Interest"}
            </button>
            <button
              onClick={handleShortlist}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
              aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
            >
              <Heart
                className={`h-4 w-4 ${shortlisted ? "fill-primary text-primary" : "text-muted-foreground"}`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
