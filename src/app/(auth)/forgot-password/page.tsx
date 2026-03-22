"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { OTPInput } from "@/components/auth/otp-input";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "mobile" | "email";
type Step = "input" | "otp" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("mobile");
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  function startResendTimer() {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOTP() {
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      });
      if (error) throw error;
      toast.success("OTP sent to your mobile number");
      setStep("otp");
      startResendTimer();
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Verified! Set your new password.");
      router.push("/reset-password");
    } catch {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendResetLink() {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setStep("success");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-background border rounded-xl p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
              <h1 className="text-xl font-bold">Forgot Password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "success"
                  ? "Check your email for the reset link."
                  : "Enter your registered mobile number or email address."}
              </p>
            </div>

            {/* Email success state */}
            {step === "success" && (
              <div className="text-center py-4 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  A password reset link has been sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Please check your inbox and follow the link.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep("input");
                    setEmail("");
                  }}
                >
                  Try a different email
                </Button>
              </div>
            )}

            {step !== "success" && (
              <>
                {/* Mode toggle */}
                {step === "input" && (
                  <div className="flex rounded-lg border overflow-hidden mb-6">
                    <button
                      onClick={() => {
                        setMode("mobile");
                        setStep("input");
                      }}
                      className={cn(
                        "flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        mode === "mobile"
                          ? "bg-primary text-white"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Phone className="h-4 w-4" />
                      Mobile Number
                    </button>
                    <button
                      onClick={() => {
                        setMode("email");
                        setStep("input");
                      }}
                      className={cn(
                        "flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        mode === "email"
                          ? "bg-primary text-white"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Mail className="h-4 w-4" />
                      Email Address
                    </button>
                  </div>
                )}

                {/* Mobile flow */}
                {mode === "mobile" && step === "input" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Mobile Number</Label>
                      <div className="flex gap-2 mt-1.5">
                        <div className="flex items-center px-3 border rounded-lg bg-muted/50 text-sm">
                          🇮🇳 +91
                        </div>
                        <Input
                          type="tel"
                          placeholder="Enter mobile number"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSendOTP}
                      disabled={loading || phone.length < 10}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "SEND OTP"
                      )}
                    </Button>
                  </div>
                )}

                {mode === "mobile" && step === "otp" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit OTP sent to +91 {phone}
                    </p>
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
                    />
                    <Button
                      className="w-full"
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "VERIFY OTP"
                      )}
                    </Button>
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Resend OTP in {resendTimer}s
                        </p>
                      ) : (
                        <button
                          onClick={handleSendOTP}
                          className="text-xs text-primary hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setStep("input");
                        setOtp("");
                      }}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
                    >
                      Change mobile number
                    </button>
                  </div>
                )}

                {/* Email flow */}
                {mode === "email" && step === "input" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSendResetLink}
                      disabled={loading || !email.includes("@")}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "SEND RESET LINK"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
