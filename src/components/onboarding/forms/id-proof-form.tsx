"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OnboardingLayout } from "../onboarding-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";

const idProofTypes = [
  "Aadhar Number",
  "Driving License",
  "Passport",
  "Voter ID",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function IdProofForm() {
  const router = useRouter();
  const supabase = createClient();
  const setCompletion = useOnboardingStore((s) => s.setCompletion);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [idProofType, setIdProofType] = useState("");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingProof, setExistingProof] = useState(false);

  const canSubmit =
    idProofType && idProofNumber.trim() && (selectedFile || existingProof);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, profile_completion_pct")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        router.replace("/register-free");
        return;
      }

      setProfileId(profile.id);
      setCompletion(profile.profile_completion_pct ?? 40);

      // Check existing ID proof
      const { data: proof } = await supabase
        .from("id_proofs")
        .select("id_proof_type, id_proof_number, verification_status")
        .eq("profile_id", profile.id)
        .single();

      if (proof) {
        setIdProofType(proof.id_proof_type);
        setIdProofNumber(proof.id_proof_number);
        setExistingProof(true);
        setUploadedFileName("Document uploaded");
      }

      setLoading(false);
    }
    load();
  }, [supabase, router, setCompletion]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF file");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("File size must be under 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(file.name);
  }

  async function handleSubmit() {
    if (!profileId || !canSubmit) return;
    setSubmitting(true);

    try {
      let signedUrl = "";

      // Upload file to Supabase Storage if new file selected
      if (selectedFile) {
        setUploading(true);
        const ext = selectedFile.name.split(".").pop() || "jpg";
        const filePath = `${profileId}/id-proof.${ext}`;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const { error: uploadError } = await supabase.storage
          .from("id-proofs")
          .upload(filePath, selectedFile, { upsert: true });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadError) throw uploadError;

        // Get signed URL (never use getPublicUrl for private docs)
        const { data: urlData } = await supabase.storage
          .from("id-proofs")
          .createSignedUrl(filePath, 3600);

        if (!urlData?.signedUrl) throw new Error("Failed to get signed URL");
        signedUrl = urlData.signedUrl;

        setUploading(false);
      }

      // Upsert to id_proofs table
      const upsertData: Record<string, unknown> = {
        profile_id: profileId,
        id_proof_type: idProofType,
        id_proof_number: idProofNumber,
        verification_status: "pending",
      };
      if (signedUrl) {
        upsertData.id_proof_url = signedUrl;
      }

      const { error } = await supabase
        .from("id_proofs")
        .upsert(upsertData, { onConflict: "profile_id" });

      if (error) throw error;

      // Update profile completion
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completion_pct")
        .eq("id", profileId)
        .single();

      if (profile) {
        const newPct = Math.min(
          Math.max(profile.profile_completion_pct ?? 40, 65),
          100
        );
        await supabase
          .from("profiles")
          .update({ profile_completion_pct: newPct })
          .eq("id", profileId);
        setCompletion(newPct);
      }

      toast.success("ID proof submitted successfully");
      setExistingProof(true);
      router.push("/my-home");
    } catch {
      toast.error("Failed to submit ID proof");
    } finally {
      setSubmitting(false);
      setUploading(false);
      setUploadProgress(0);
    }
  }

  if (loading) {
    return (
      <OnboardingLayout currentStep={5}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={5}>
      <div className="bg-white rounded-lg border border-input p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Submit ID Proof
        </h2>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Your ID is kept confidential and used only for verification
          </p>
        </div>

        <div className="space-y-4">
          {/* ID Proof Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ID Proof Type <span className="text-destructive">*</span>
            </label>
            <select
              value={idProofType}
              onChange={(e) => setIdProofType(e.target.value)}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Select ID type</option>
              {idProofTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* ID Proof Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ID Proof Number <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={idProofNumber}
              onChange={(e) => setIdProofNumber(e.target.value)}
              placeholder="Enter your ID number"
              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload ID Document <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {uploadedFileName ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                  <span className="text-sm font-medium text-foreground">
                    {uploadedFileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadedFileName(null);
                      if (!existingProof) setExistingProof(false);
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive ml-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or PDF &middot; Max 5MB
                  </p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => router.push("/my-home")}
          className="h-11 px-6 border border-input text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="h-11 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit
        </button>
      </div>
    </OnboardingLayout>
  );
}
