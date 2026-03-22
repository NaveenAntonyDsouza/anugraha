"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ActivityFeedItem, type NotificationItem } from "./activity-feed-item";

export function ActivityFeed() {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setNotifications(data as NotificationItem[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-input p-6">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h2>
      <div className="bg-white rounded-lg border border-input overflow-hidden">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No recent activity.
          </p>
        ) : (
          <div className="divide-y divide-input">
            {notifications.map((n) => (
              <ActivityFeedItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
