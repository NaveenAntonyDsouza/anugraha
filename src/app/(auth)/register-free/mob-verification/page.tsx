"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { OTPInput } from "@/components/auth/otp-input";
import { RegistrationLayout } from "@/components/auth/registration-layout";

export default function MobVerificationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    async function getPhone() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.phone) setPhone(user.phone);
    }
    getPhone();
  }, [supabase]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const maskedPhone = phone
    ? `${phone.slice(0, 6)} ${"X".repeat(Math.max(0, phone.length - 6))}`
    : "";

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Mobile number verified!");
      router.push("/register-free/email-verification");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setResendTimer(30);
      setOtp("");
      toast.success("OTP resent!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP";
      toast.error(message);
    }
  };

  return (
    <RegistrationLayout
      currentStep={5}
      title="Verify Mobile Number"
      subtitle={`OTP sent to ${maskedPhone}`}
    >
      <div className="space-y-6">
        <OTPInput value={otp} onChange={setOtp} disabled={loading} />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className={cn(
            "w-full h-11 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
            otp.length === 6 && !loading
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          VERIFY
        </button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend OTP in {resendTimer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-primary font-medium underline hover:no-underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/register-free/email-verification")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </RegistrationLayout>
  );
}
