"use client";

import { cn } from "@/lib/utils";

interface ProfileCompletionBarProps {
  percent: number;
}

export function ProfileCompletionBar({ percent }: ProfileCompletionBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  const barColor =
    clamped >= 80
      ? "bg-[var(--success)]"
      : clamped >= 50
        ? "bg-[var(--warning)]"
        : "bg-destructive";

  const textColor =
    clamped >= 80
      ? "text-[var(--success)]"
      : clamped >= 50
        ? "text-[var(--warning)]"
        : "text-destructive";

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">Profile Completion</span>
        <span className={cn("font-semibold", textColor)}>{clamped}% Complete</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
