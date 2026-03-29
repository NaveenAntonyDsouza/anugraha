"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Shield } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SectionEditForm } from "@/components/profile/section-edit-form";

const idProofTypes = [
  "Aadhar Number",
  "Driving License",
  "Passport",
  "Voter ID",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function IdProofEditPage() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function load() {
      if (!profile) { if (!authLoading) setLoading(false); return; }
      const { data } = await supabase
        .from("id_proofs")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setIdType(data.id_type ?? "");
        setIdNumber(data.id_number ?? "");
        setFileUrl(data.file_url ?? "");
        if (data.file_url) setFileName("Document uploaded");
      }
      setLoading(false);
    }
    load();
  }, [profile, authLoading, supabase]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    const ext = file.name.split(".").pop();
    const path = `${profile.id}/id-proof-${Date.now()}.${ext}`;

    setUploadProgress(60);

    const { error } = await supabase.storage
      .from("id-proofs")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
      return;
    }

    setUploadProgress(90);

    // Get signed URL (private bucket — never getPublicUrl)
    const { data: signed } = await supabase.storage
      .from("id-proofs")
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

    setFileUrl(signed?.signedUrl ?? path);
    setFileName(file.name);
    setUploadProgress(100);
    setUploading(false);
    toast.success("Document uploaded.");
  }

  async function onSave() {
    if (!profile) return;

    if (!idType) {
      toast.error("Please select an ID type.");
      return;
    }
    if (!idNumber.trim()) {
      toast.error("Please enter your ID number.");
      return;
    }
    if (!fileUrl) {
      toast.error("Please upload your ID document.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("id_proofs").upsert(
      {
        profile_id: profile.id,
        id_type: idType,
        id_number: idNumber.trim(),
        file_url: fileUrl,
        verification_status: "pending",
      },
      { onConflict: "profile_id" }
    );

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    toast.success("ID proof submitted for verification.");
    setSaving(false);
    router.push("/my-home/view-and-edit/id-proof");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SectionEditForm
      title="Submit ID Proof"
      breadcrumb="ID Proof"
      cancelHref="/my-home/view-and-edit/id-proof"
      saving={saving}
      onSave={onSave}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            ID Type *
          </label>
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white"
          >
            <option value="">Select ID Type</option>
            {idProofTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            ID Number *
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter your ID number"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Upload Document *
          </label>
          <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
            {fileName ? (
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{fileName}</span>
              </div>
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            )}
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              JPG, PNG, or PDF (max 5MB)
            </p>
            <label className="cursor-pointer inline-flex h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors items-center gap-2">
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {fileName ? "Replace" : "Choose File"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </SectionEditForm>
  );
}
