"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgressBarProps {
  steps: number;
  current: number;
  labels?: string[];
}

export function StepProgressBar({
  steps,
  current,
  labels,
}: StepProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: steps }).map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < current;
          const isActive = stepNum === current;

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground border-2 border-input"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                {labels?.[i] && (
                  <span
                    className={cn(
                      "mt-1.5 text-xs text-center whitespace-nowrap",
                      (isActive || isCompleted) ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>

              {stepNum < steps && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-input"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
