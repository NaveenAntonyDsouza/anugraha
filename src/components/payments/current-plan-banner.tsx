"use client";

import { Crown } from "lucide-react";

interface CurrentPlanBannerProps {
  planName: string;
  expiresAt: string;
}

export function CurrentPlanBanner({ planName, expiresAt }: CurrentPlanBannerProps) {
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
      <Crown className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-sm font-medium">
          You are on the <span className="text-primary font-semibold">{planName}</span> plan
        </p>
        <p className="text-xs text-muted-foreground">
          Expires on {expiryDate}
        </p>
      </div>
    </div>
  );
}
