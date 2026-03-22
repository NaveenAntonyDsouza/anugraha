"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const BANNERS = [
  {
    id: "complete_profile",
    title: "Ensure Profile Completeness",
    subtitle: "",
    href: "/my-home/view-and-edit/primary-info",
    gradient: "from-primary/90 to-primary/70",
    showPct: true,
  },
  {
    id: "add_photos",
    title: "Upload More Photos",
    subtitle: "Add photos to get more responses",
    href: "/my-home/view-and-edit/manage-photos",
    gradient: "from-cyan-600 to-cyan-500",
    showPct: false,
  },
  {
    id: "verify_profile",
    title: "Upload ID Proof",
    subtitle: "Get verified badge on your profile",
    href: "/submit-id-proof",
    gradient: "from-emerald-600 to-emerald-500",
    showPct: false,
  },
  {
    id: "manage_filters",
    title: "Manage Filters",
    subtitle: "Control who can see your profile",
    href: "/my-home/profile-settings",
    gradient: "from-amber-600 to-amber-500",
    showPct: false,
  },
  {
    id: "update_preferences",
    title: "Update Partner Preferences",
    subtitle: "Refine your search criteria",
    href: "/my-home/view-and-edit/partner-preference-edit",
    gradient: "from-rose-600 to-rose-500",
    showPct: false,
  },
];

export function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const loadPct = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("profiles")
      .select("profile_completion_pct")
      .eq("id", profile.id)
      .single();
    if (data) setCompletionPct(data.profile_completion_pct ?? 0);
  }, [profile, supabase]);

  useEffect(() => {
    loadPct();
  }, [loadPct]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  const next = () => setCurrent((c) => (c + 1) % BANNERS.length);

  const banner = BANNERS[current];

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        href={banner.href}
        className={cn(
          "block bg-gradient-to-r p-6 sm:p-8 text-white transition-all duration-300",
          banner.gradient
        )}
      >
        <h3 className="text-lg sm:text-xl font-bold">{banner.title}</h3>
        <p className="text-sm text-white/80 mt-1">
          {banner.showPct ? `${completionPct}% complete` : banner.subtitle}
        </p>
        <span className="inline-block mt-3 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors">
          Go →
        </span>
      </Link>

      {/* Arrows */}
      <button
        onClick={(e) => { e.preventDefault(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); setCurrent(i); }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === current ? "bg-white w-4" : "bg-white/50"
            )}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
