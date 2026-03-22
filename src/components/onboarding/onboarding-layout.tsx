"use client";

import Link from "next/link";
import { ProfileCompletionBar } from "./profile-completion-bar";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Additional Info", path: "/register-free/additional-step-one" },
  { label: "Location & Contact", path: "/register-free/additional-step-two" },
  { label: "Preferences", path: "/register-free/partner-preference" },
  { label: "Photos", path: "/upload-photos" },
  { label: "ID Proof", path: "/submit-id-proof" },
];

interface OnboardingLayoutProps {
  currentStep: number; // 1-based index
  children: React.ReactNode;
}

export function OnboardingLayout({
  currentStep,
  children,
}: OnboardingLayoutProps) {
  const profileCompletion = useOnboardingStore((s) => s.profileCompletion);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Logo bar */}
      <div className="bg-white border-b border-input">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-primary hidden sm:block">
              Anugraha Matrimony
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                      isCompleted
                        ? "bg-[var(--success)] text-white"
                        : isActive
                          ? "bg-primary text-white ring-2 ring-primary/30"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? "\u2713" : stepNum}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-1 text-center hidden sm:block",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      isCompleted ? "bg-[var(--success)]" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Profile completion bar */}
        <div className="mb-4">
          <ProfileCompletionBar percent={profileCompletion} />
        </div>

        {/* Notice */}
        <p className="text-xs text-muted-foreground text-center mb-6">
          You can always edit these details later from your profile settings.
        </p>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
