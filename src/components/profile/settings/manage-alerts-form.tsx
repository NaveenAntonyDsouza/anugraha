"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface NotificationPreferences {
  mail: { message: boolean; photo_request: boolean; promotions: boolean; contact_views: boolean; match_alert: boolean };
  sms: { message: boolean; photo_request: boolean; promotions: boolean; contact_views: boolean };
  whatsapp: { message: boolean; photo_request: boolean; contact_views: boolean; membership: boolean };
  push: { message: boolean; photo_request: boolean; promotions: boolean; contact_views: boolean };
}

const defaultPreferences: NotificationPreferences = {
  mail: { message: true, photo_request: true, promotions: true, contact_views: true, match_alert: true },
  sms: { message: true, photo_request: true, promotions: true, contact_views: true },
  whatsapp: { message: true, photo_request: true, contact_views: true, membership: true },
  push: { message: true, photo_request: true, promotions: true, contact_views: true },
};

const childLabels: Record<string, string> = {
  message: "Message",
  photo_request: "Photo Request",
  promotions: "Promotions",
  contact_views: "Contact Views",
  match_alert: "Match Alert",
  membership: "Membership",
};

const groupLabels: Record<keyof NotificationPreferences, string> = {
  mail: "Mail Alert",
  sms: "SMS Alert",
  whatsapp: "WhatsApp Alert",
  push: "App Push Notification Alert",
};

function AlertGroup({
  groupKey,
  label,
  children,
  onToggleMaster,
  onToggleChild,
}: {
  groupKey: keyof NotificationPreferences;
  label: string;
  children: Record<string, boolean>;
  onToggleMaster: (groupKey: keyof NotificationPreferences, checked: boolean) => void;
  onToggleChild: (groupKey: keyof NotificationPreferences, childKey: string, checked: boolean) => void;
}) {
  const childEntries = Object.entries(children);
  const allChecked = childEntries.every(([, v]) => v);
  const someChecked = childEntries.some(([, v]) => v) && !allChecked;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
        <input
          type="checkbox"
          checked={allChecked}
          ref={(el) => {
            if (el) el.indeterminate = someChecked;
          }}
          onChange={(e) => onToggleMaster(groupKey, e.target.checked)}
          className="rounded border-input accent-primary"
        />
        {label}
      </label>
      <div className="ml-6 space-y-1.5">
        {childEntries.map(([key, value]) => (
          <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onToggleChild(groupKey, key, e.target.checked)}
              className="rounded border-input accent-primary"
            />
            {childLabels[key] ?? key}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ManageAlertsForm() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPrefs() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("privacy_settings")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .single();

      if (data?.notification_preferences) {
        setPrefs(data.notification_preferences as NotificationPreferences);
      }
      setLoading(false);
    }

    fetchPrefs();
  }, []);

  function handleToggleMaster(groupKey: keyof NotificationPreferences, checked: boolean) {
    setPrefs((prev) => {
      const group = prev[groupKey];
      const updated = Object.fromEntries(
        Object.keys(group).map((k) => [k, checked])
      ) as typeof group;
      return { ...prev, [groupKey]: updated };
    });
  }

  function handleToggleChild(groupKey: keyof NotificationPreferences, childKey: string, checked: boolean) {
    setPrefs((prev) => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [childKey]: checked },
    }));
  }

  async function handleSave() {
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
        { user_id: user.id, notification_preferences: prefs },
        { onConflict: "user_id" }
      );

    if (error) {
      toast.error("Failed to save alert preferences.");
    } else {
      toast.success("Alert preferences saved.");
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
        <h2 className="text-lg font-semibold">Manage Alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You can manage the notifications, which you are receiving on your phone or email by toggling them off or on.
        </p>
      </div>

      <div className="space-y-5">
        {(Object.keys(groupLabels) as (keyof NotificationPreferences)[]).map((groupKey) => (
          <AlertGroup
            key={groupKey}
            groupKey={groupKey}
            label={groupLabels[groupKey]}
            children={prefs[groupKey]}
            onToggleMaster={handleToggleMaster}
            onToggleChild={handleToggleChild}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        SAVE
      </button>
    </div>
  );
}
