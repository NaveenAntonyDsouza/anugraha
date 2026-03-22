"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type ProfileFilterValue = "all_members" | "premium_members" | "matches_only";

const filterOptions: { label: string; value: ProfileFilterValue }[] = [
  { label: "To all members (Recommended)", value: "all_members" },
  { label: "To all premium members", value: "premium_members" },
  { label: "Only to those whom I have included in my matches list", value: "matches_only" },
];

export default function ProfileFiltersForm() {
  const [selected, setSelected] = useState<ProfileFilterValue | null>(null);
  const [savedValue, setSavedValue] = useState<ProfileFilterValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchFilter() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("privacy_settings")
        .select("show_profile_to")
        .eq("user_id", user.id)
        .single();

      const value = (data?.show_profile_to as ProfileFilterValue) ?? "all_members";
      setSelected(value);
      setSavedValue(value);
      setLoading(false);
    }

    fetchFilter();
  }, []);

  async function handleSubmit() {
    if (!selected || selected === savedValue) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("privacy_settings")
      .upsert(
        { user_id: user.id, show_profile_to: selected },
        { onConflict: "user_id" }
      );

    if (error) {
      toast.error("Failed to save profile filter.");
    } else {
      setSavedValue(selected);
      toast.success("Profile filter saved.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile Filters</h2>
        <p className="text-sm text-muted-foreground mt-1">Show my profile to:</p>
      </div>

      <div className="space-y-3">
        {filterOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
              className="rounded border-input accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || selected === savedValue || saving}
        className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        SUBMIT
      </button>
    </div>
  );
}
