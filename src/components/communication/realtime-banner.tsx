"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, RefreshCw } from "lucide-react";

interface RealtimeBannerProps {
  profileId: string;
  onRefresh: () => void;
}

export function RealtimeBanner({ profileId, onRefresh }: RealtimeBannerProps) {
  const [newCount, setNewCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("new-interests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interest_messages",
          filter: `receiver_id=eq.${profileId}`,
        },
        () => {
          setNewCount((c) => c + 1);
          setDismissed(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  if (newCount === 0 || dismissed) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between mb-4">
      <button
        onClick={() => {
          setNewCount(0);
          onRefresh();
        }}
        className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
      >
        <RefreshCw className="h-4 w-4" />
        You have {newCount} new interest{newCount !== 1 ? "s" : ""}. Click to refresh.
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-muted"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
