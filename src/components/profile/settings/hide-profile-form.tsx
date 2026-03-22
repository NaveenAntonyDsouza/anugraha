"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function HideProfileForm() {
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("privacy_settings")
        .select("hide_from_search")
        .eq("user_id", user.id)
        .single();

      setHidden(data?.hide_from_search ?? false);
      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleToggle() {
    if (saving) return;

    const newValue = !hidden;
    setHidden(newValue);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setHidden(!newValue);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("privacy_settings")
      .upsert(
        { user_id: user.id, hide_from_search: newValue },
        { onConflict: "user_id" }
      );

    if (error) {
      setHidden(!newValue);
      toast.error("Failed to save setting");
    } else {
      toast.success(
        newValue ? "Profile hidden" : "Profile visible in search"
      );
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
    <div>
      <h2 className="text-lg font-semibold text-foreground">Hide Profile</h2>

      <div className="mt-6 flex items-start justify-between gap-4 py-3">
        <p className="flex-1 text-sm font-medium text-foreground">
          Hide my profile from search results
        </p>
        <button
          role="switch"
          aria-checked={hidden}
          disabled={saving}
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            hidden ? "bg-primary" : "bg-muted",
            saving && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              hidden ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {hidden && (
        <div className="mt-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-sm">
          Your profile will not appear in any search results while hidden. You
          can still browse other profiles.
        </div>
      )}
    </div>
  );
}
