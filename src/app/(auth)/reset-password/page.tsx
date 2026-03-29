"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [expired, setExpired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === "PASSWORD_RECOVERY") {
          setShowForm(true);
          setChecking(false);
        }
      }
    );

    // Also check if user already has a session (e.g., from OTP flow)
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setShowForm(true);
      } else {
        // Wait a moment for the hash fragment to be processed
        setTimeout(() => {
          setChecking(false);
        }, 2000);
      }
      setChecking(false);
    };
    checkSession();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation
  const isLengthValid = newPassword.length >= 6 && newPassword.length <= 14;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid = isLengthValid && hasLetters && hasNumbers && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          setExpired(true);
          setShowForm(false);
          return;
        }
        throw error;
      }
      toast.success("Password updated successfully!");
      router.push("/login");
    } catch {
      toast.error("Failed to update password. Please try again.");
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
            {/* Loading state */}
            {checking && !showForm && !expired && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Verifying your reset link...
                </p>
              </div>
            )}

            {/* Expired token */}
            {expired && (
              <div className="text-center py-4 space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-xl font-bold">Link Expired</h1>
                <p className="text-sm text-muted-foreground">
                  This password reset link has expired or is invalid. Please
                  request a new one.
                </p>
                <Link href="/forgot-password">
                  <Button className="w-full">Request New Link</Button>
                </Link>
              </div>
            )}

            {/* No session, not checking, not expired */}
            {!checking && !showForm && !expired && (
              <div className="text-center py-4 space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <h1 className="text-xl font-bold">Invalid Link</h1>
                <p className="text-sm text-muted-foreground">
                  This link is invalid or has already been used. Please request a
                  new password reset link.
                </p>
                <Link href="/forgot-password">
                  <Button className="w-full">Request New Link</Button>
                </Link>
              </div>
            )}

            {/* Password form */}
            {showForm && (
              <>
                <h1 className="text-xl font-bold mb-1">Set New Password</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a new password for your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        maxLength={14}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        maxLength={14}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Validation hints */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <ValidationRule
                        met={isLengthValid}
                        text="6-14 characters"
                      />
                      <ValidationRule
                        met={hasLetters}
                        text="Contains letters"
                      />
                      <ValidationRule
                        met={hasNumbers}
                        text="Contains numbers"
                      />
                      {confirmPassword.length > 0 && (
                        <ValidationRule
                          met={passwordsMatch}
                          text="Passwords match"
                        />
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isValid || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "UPDATE PASSWORD"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ValidationRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}
