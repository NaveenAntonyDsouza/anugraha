"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ToggleKey =
  | "show_outside_age_norm"
  | "show_outside_height_norm"
  | "show_in_near_me"
  | "show_outside_religion"
  | "show_outside_caste";

type Gender = "male" | "female";

const DEFAULTS: Record<ToggleKey, boolean> = {
  show_outside_age_norm: true,
  show_outside_height_norm: true,
  show_in_near_me: true,
  show_outside_religion: false,
  show_outside_caste: false,
};

function getLabel(key: ToggleKey, gender: Gender | null): string {
  switch (key) {
    case "show_outside_age_norm":
      return gender === "male"
        ? "I am willing to display my profile to those who are older than me"
        : "I am willing to display my profile to those who are younger than me";
    case "show_outside_height_norm":
      return gender === "male"
        ? "I am willing to display my profile to those who are taller than me"
        : "I am willing to display my profile to those who are shorter than me";
    case "show_in_near_me":
      return "Near Me (Applicable for Mobile App only)";
    case "show_outside_religion":
      return "I am willing to display my profile to those of other religions";
    case "show_outside_caste":
      return "I am willing to display my profile to those of other castes / communities";
  }
}

function getSubText(key: ToggleKey): string | undefined {
  if (key === "show_in_near_me") {
    return "Allow others to view my profile in 'NEAR ME' search result.";
  }
  return undefined;
}

function ToggleRow({
  label,
  subText,
  checked,
  onChange,
  saving,
}: {
  label: string;
  subText?: string;
  checked: boolean;
  onChange: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {subText && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subText}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={saving}
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
          saving && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

const TOGGLE_KEYS: ToggleKey[] = [
  "show_outside_age_norm",
  "show_outside_height_norm",
  "show_in_near_me",
  "show_outside_religion",
  "show_outside_caste",
];

export default function SearchVisibilityForm() {
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(DEFAULTS);
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<ToggleKey | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [settingsRes, profileRes] = await Promise.all([
        supabase
          .from("privacy_settings")
          .select(
            "show_outside_age_norm, show_outside_height_norm, show_in_near_me, show_outside_religion, show_outside_caste"
          )
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("gender")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (settingsRes.data) {
        setToggles({
          show_outside_age_norm:
            settingsRes.data.show_outside_age_norm ?? DEFAULTS.show_outside_age_norm,
          show_outside_height_norm:
            settingsRes.data.show_outside_height_norm ?? DEFAULTS.show_outside_height_norm,
          show_in_near_me:
            settingsRes.data.show_in_near_me ?? DEFAULTS.show_in_near_me,
          show_outside_religion:
            settingsRes.data.show_outside_religion ?? DEFAULTS.show_outside_religion,
          show_outside_caste:
            settingsRes.data.show_outside_caste ?? DEFAULTS.show_outside_caste,
        });
      }

      if (profileRes.data?.gender) {
        setGender(profileRes.data.gender as Gender);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleToggle = useCallback(
    async (key: ToggleKey) => {
      if (savingKey) return;

      const newValue = !toggles[key];
      setToggles((prev) => ({ ...prev, [key]: newValue }));
      setSavingKey(key);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setToggles((prev) => ({ ...prev, [key]: !newValue }));
        setSavingKey(null);
        return;
      }

      const { error } = await supabase
        .from("privacy_settings")
        .upsert(
          { user_id: user.id, [key]: newValue },
          { onConflict: "user_id" }
        );

      if (error) {
        setToggles((prev) => ({ ...prev, [key]: !newValue }));
        toast.error("Failed to save setting");
      } else {
        toast.success("Saved");
      }

      setSavingKey(null);
    },
    [toggles, savingKey]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        Search Visibility
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enhance search visibility by extending your age and height requirements
      </p>

      <div className="mt-6 divide-y">
        {TOGGLE_KEYS.map((key) => (
          <ToggleRow
            key={key}
            label={getLabel(key, gender)}
            subText={getSubText(key)}
            checked={toggles[key]}
            onChange={() => handleToggle(key)}
            saving={savingKey === key}
          />
        ))}
      </div>
    </div>
  );
}
