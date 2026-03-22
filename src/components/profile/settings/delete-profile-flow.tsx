"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | "2a" | "2b" | "2c" | "3a" | "3b" | "3c";

const PRIMARY_REASONS = [
  "I am Married",
  "My Marriage is Fixed",
  "Other Reasons",
] as const;

const SUB_REASONS = [
  "Through AnugrahaMatrimony.com",
  "Through other matrimonial site",
  "Through other means",
] as const;

export default function DeleteProfileFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [primaryReason, setPrimaryReason] = useState("");
  const [subReason, setSubReason] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [siteName, setSiteName] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function goBack() {
    if (step === "2a" || step === "2b" || step === "2c") setStep(1);
    else if (step === "3a" || step === "3b" || step === "3c") {
      setStep(primaryReason === "I am Married" ? "2a" : "2b");
    }
  }

  function handlePrimary(reason: string) {
    setPrimaryReason(reason);
    if (reason === "I am Married") setStep("2a");
    else if (reason === "My Marriage is Fixed") setStep("2b");
    else setStep("2c");
  }

  function handleSub(sub: string) {
    setSubReason(sub);
    if (sub === "Through AnugrahaMatrimony.com") setStep("3a");
    else if (sub === "Through other matrimonial site") setStep("3b");
    else setStep("3c");
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deletionReason: Record<string, string> = {
        primary: primaryReason,
        sub: subReason,
        wedding_date: weddingDate,
        partner_id: partnerId,
        site_name: siteName,
        details: otherDetails,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
          deletion_reason: deletionReason,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Your profile has been deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete profile. Please try again.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  const rowClass =
    "flex items-center justify-between p-4 border border-input rounded-lg hover:bg-muted/50 cursor-pointer transition-colors";
  const deleteButtonClass =
    "h-11 px-6 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-4">
      {step !== 1 && (
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      {/* Step 1 — Primary Reason */}
      {step === 1 && (
        <div className="space-y-3">
          {PRIMARY_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => handlePrimary(reason)}
              className={rowClass}
            >
              <span className="text-sm font-medium">{reason}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Step 2a / 2b — Sub Reasons */}
      {(step === "2a" || step === "2b") && (
        <div className="space-y-3">
          {SUB_REASONS.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSub(sub)}
              className={rowClass}
            >
              <span className="text-sm font-medium">{sub}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Step 3a — Through AnugrahaMatrimony.com */}
      {step === "3a" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Wedding Date (optional)
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Your partner&apos;s Anugraha ID (optional)
            </label>
            <input
              type="text"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="e.g. AM123456"
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className={deleteButtonClass}
          >
            DELETE PROFILE
          </button>
        </div>
      )}

      {/* Step 3b — Through other matrimonial site */}
      {step === "3b" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Wedding Date (optional)
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Matrimonial Site/App Name (optional)
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site or app name"
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className={deleteButtonClass}
          >
            DELETE PROFILE
          </button>
        </div>
      )}

      {/* Step 3c — Through other means */}
      {step === "3c" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Wedding Date (optional)
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className={deleteButtonClass}
          >
            DELETE PROFILE
          </button>
        </div>
      )}

      {/* Step 2c — Other Reasons */}
      {step === "2c" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">
            Please specify the reasons
          </h3>
          <div>
            <textarea
              value={otherDetails}
              onChange={(e) =>
                setOtherDetails(e.target.value.slice(0, 200))
              }
              placeholder="Enter your reasons"
              rows={4}
              maxLength={200}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {otherDetails.length} Characters Typed (Max. 200 Chars)
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={otherDetails.length === 0}
            className={deleteButtonClass}
          >
            DELETE PROFILE
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-6">
            <p className="text-sm text-center font-medium">
              Are you sure, you wish to delete your profile?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="h-10 px-6 border border-input rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                NO
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "YES"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
