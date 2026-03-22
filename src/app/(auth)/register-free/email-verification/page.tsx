"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { RegistrationLayout } from "@/components/auth/registration-layout";

export default function EmailVerificationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    async function getEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    }
    getEmail();
  }, [supabase]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "";

  const handleResend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setResendCooldown(60);
      toast.success("Verification email resent!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user?.email_confirmed_at) {
        // Update user verification status
        await supabase
          .from("users")
          .update({ email_verified: true })
          .eq("id", user.id);

        router.push("/register-free/congratulation");
      } else {
        toast.info("Please verify your email first. Check your inbox.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification check failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationLayout
      currentStep={5}
      title="Verify Email Address"
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to
          </p>
          <p className="font-semibold text-foreground mt-1">{maskedEmail}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          Please check your inbox and click the verification link, then come back here and click continue.
        </p>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          I have verified, Continue
        </button>

        <div>
          {resendCooldown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend email in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-primary font-medium underline hover:no-underline"
            >
              Resend Email
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/register-free/congratulation")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </RegistrationLayout>
  );
}
