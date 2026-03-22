"use client";

import Link from "next/link";
import { StepProgressBar } from "./step-progress-bar";

const STEP_LABELS = [
  "Basic Info",
  "Personal",
  "Education",
  "Location",
  "Final",
];

interface RegistrationLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  title: string;
  subtitle?: string;
}

export function RegistrationLayout({
  children,
  currentStep,
  title,
  subtitle,
}: RegistrationLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Logo bar */}
      <div className="bg-white border-b border-input">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">
                Anugraha Matrimony
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Connecting Hearts
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-input">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <StepProgressBar
            steps={5}
            current={currentStep}
            labels={STEP_LABELS}
          />
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-white rounded-xl shadow-sm border border-input p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
