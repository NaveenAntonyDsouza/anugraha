"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PartyPopper, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CongratulationPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [anugrahaId, setAnugrahaId] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, anugraha_id, onboarding_step_completed")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        setAnugrahaId(profile.anugraha_id);

        // Mark onboarding as complete
        await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            profile_completion_pct: 40,
          })
          .eq("user_id", user.id);

        // Send welcome email
        try {
          await fetch("/api/auth/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: profile.full_name,
              profileId: profile.anugraha_id,
              email: user.email,
            }),
          });
        } catch {
          // Non-critical, don't block user
        }
      }
    }
    loadProfile();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-input p-8 sm:p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Congratulations!
        </h1>
        <p className="text-lg text-foreground font-medium mb-1">
          {fullName}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Your profile has been created successfully
        </p>

        {anugrahaId && (
          <div className="bg-primary/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              Your Profile ID
            </p>
            <p className="text-2xl font-bold text-primary">{anugrahaId}</p>
          </div>
        )}

        {/* Profile completion bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-semibold text-primary">40%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: "40%" }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/register-free/additional-step-one"
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Complete Your Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/my-home"
            className="w-full h-11 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
