"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Lock,
  Headphones,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { OTPInput } from "@/components/auth/otp-input";
import { PhoneInput } from "@/components/auth/phone-input";
import { PublicHeader } from "@/components/shared/PublicHeader";

type Screen = "mobile" | "choose" | "otp" | "password";
type OtpChannel = "whatsapp" | "sms" | "email";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [screen, setScreen] = useState<Screen>("mobile");
  const [otpChannel, setOtpChannel] = useState<OtpChannel>("whatsapp");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordIdentifier, setPasswordIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
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
  };

  const maskedPhone = phone
    ? `${countryCode} ${phone.slice(0, 5)} ${"X".repeat(Math.max(0, phone.length - 5))}`
    : "";

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      if (otpChannel === "email") {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      } else {
        const fullPhone = `${countryCode}${phone}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (error) throw error;
      }
      setOtp("");
      setScreen("otp");
      startResendTimer();
      toast.success(`OTP sent via ${otpChannel === "email" ? "email" : otpChannel === "sms" ? "SMS" : "WhatsApp"}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      let result;
      if (otpChannel === "email") {
        result = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });
      } else {
        result = await supabase.auth.verifyOtp({
          phone: `${countryCode}${phone}`,
          token: otp,
          type: "sms",
        });
      }
      if (result.error) throw result.error;
      await handlePostLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!passwordIdentifier || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: passwordIdentifier,
        password,
      });
      if (error) throw error;
      toast.warning("Password login will be discontinued soon. Please switch to OTP login.");
      await handlePostLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single();

    if (profile?.onboarding_completed) {
      router.push("/my-home");
    } else {
      router.push("/register-free/additional-step-one");
    }
  };

  const isPhoneValid = phone.length >= 7;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side — illustration */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-10 text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-primary/5 rounded-full flex items-center justify-center">
                <span className="text-6xl">💑</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back!
              </h2>
              <p className="text-muted-foreground">
                Login now and connect with your matches.
              </p>
            </div>
          </div>

          {/* Right side — login card */}
          <div className="bg-white rounded-xl shadow-sm border border-input p-6 sm:p-8">
            {/* SCREEN A — Mobile OTP (default) */}
            {screen === "mobile" && (
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  {otpChannel === "email" ? "Login with Email OTP" : "Login with Mobile Number"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {otpChannel === "email"
                    ? "Please enter your email to receive OTP"
                    : "Please enter the mobile number to receive OTP via WhatsApp"}
                </p>

                {otpChannel === "email" ? (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 px-3 border border-input rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                    />
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading || (otpChannel === "email" ? !isEmailValid : !isPhoneValid)}
                  className={cn(
                    "w-full h-11 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                    (otpChannel === "email" ? isEmailValid : isPhoneValid) && !loading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  GET OTP
                </button>

                <button
                  onClick={() => setScreen("choose")}
                  className="w-full mt-4 text-sm text-primary font-medium underline hover:no-underline"
                >
                  TRY ANOTHER WAY
                </button>
              </div>
            )}

            {/* SCREEN B — Choose sign-in method */}
            {screen === "choose" && (
              <div>
                <button
                  onClick={() => setScreen("mobile")}
                  className="mb-4 p-1 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-bold text-foreground mb-1">
                  Choose Your Sign-in Method
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Pick the option that works best for you.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setOtpChannel("sms");
                      setScreen("mobile");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent transition-colors text-left"
                  >
                    <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">Get OTP Via SMS</span>
                  </button>

                  <button
                    onClick={() => {
                      setOtpChannel("email");
                      setScreen("mobile");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent transition-colors text-left"
                  >
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">Get OTP Via Email</span>
                  </button>

                  <hr className="my-3 border-input" />

                  <button
                    onClick={() => setScreen("password")}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border border-input hover:bg-accent transition-colors text-left"
                  >
                    <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Login with Password</span>
                      <p className="text-xs text-destructive mt-0.5">
                        This feature will be discontinued soon.
                      </p>
                    </div>
                  </button>

                  <Link
                    href="/help"
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent transition-colors"
                  >
                    <Headphones className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">Get Support</span>
                  </Link>
                </div>
              </div>
            )}

            {/* SCREEN C — OTP Entry */}
            {screen === "otp" && (
              <div>
                <button
                  onClick={() => setScreen("mobile")}
                  className="mb-4 p-1 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-bold text-foreground mb-1">
                  Enter OTP
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {otpChannel === "email"
                    ? `OTP sent to ${email}`
                    : `OTP sent to ${maskedPhone} via ${otpChannel === "sms" ? "SMS" : "WhatsApp"}`}
                </p>

                <div className="mb-6">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className={cn(
                    "w-full h-11 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                    otp.length === 6 && !loading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  VERIFY OTP
                </button>

                <div className="mt-4 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      className="text-sm text-primary font-medium underline hover:no-underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setScreen("choose")}
                  className="w-full mt-3 text-sm text-primary font-medium underline hover:no-underline"
                >
                  Try another way
                </button>
              </div>
            )}

            {/* SCREEN D — Password login */}
            {screen === "password" && (
              <div>
                <button
                  onClick={() => setScreen("choose")}
                  className="mb-4 p-1 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-bold text-foreground mb-6">
                  Login with Password
                </h1>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Mobile Number or Email
                    </label>
                    <input
                      type="text"
                      value={passwordIdentifier}
                      onChange={(e) => setPasswordIdentifier(e.target.value)}
                      placeholder="Enter mobile number or email"
                      className="w-full h-11 px-3 border border-input rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-11 px-3 pr-10 border border-input rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="block text-right mt-1.5 text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <button
                  onClick={handlePasswordLogin}
                  disabled={loading || !passwordIdentifier || !password}
                  className={cn(
                    "w-full h-11 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                    passwordIdentifier && password && !loading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  LOGIN
                </button>

                <button
                  onClick={() => setScreen("choose")}
                  className="w-full mt-4 text-sm text-primary font-medium underline hover:no-underline"
                >
                  TRY ANOTHER WAY
                </button>
              </div>
            )}

            {/* Register link */}
            <div className="mt-6 pt-6 border-t border-input text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register-free"
                  className="text-primary font-semibold hover:underline"
                >
                  REGISTER FREE
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
