"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle, Clock, XCircle, FileText, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

interface IdProof {
  id: string;
  id_type: string;
  id_number: string;
  file_url: string;
  verification_status: string;
}

export default function IdProofViewPage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const [loading, setLoading] = useState(true);
  const [idProof, setIdProof] = useState<IdProof | null>(null);

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
      if (data) setIdProof(data);
      setLoading(false);
    }
    load();
  }, [profile, authLoading, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mask ID number — show only last 4 digits
  function maskIdNumber(num: string) {
    if (num.length <= 4) return num;
    return "\u2022".repeat(num.length - 4) + num.slice(-4);
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
      label: "Verification Pending",
    },
    verified: {
      icon: CheckCircle,
      color: "text-[var(--success)] bg-green-50",
      label: "Verified",
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive bg-red-50",
      label: "Rejected",
    },
  };

  return (
    <div className="bg-white rounded-lg border border-input">
      <div className="flex items-center justify-between p-4 border-b border-input">
        <h2 className="text-base font-semibold text-foreground">ID Proof</h2>
        <Link
          href="/my-home/view-and-edit/id-proof-edit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          {idProof ? "Update" : "Submit"}
        </Link>
      </div>

      <div className="p-4">
        {!idProof ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No ID proof submitted yet. Submit your ID proof to get verified.
            </p>
            <Link
              href="/my-home/view-and-edit/id-proof-edit"
              className="inline-flex h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors items-center"
            >
              Submit ID Proof
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Status badge */}
            {(() => {
              const status = statusConfig[idProof.verification_status as keyof typeof statusConfig] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-input">
              <span className="text-sm text-muted-foreground sm:w-48 sm:flex-shrink-0">ID Type</span>
              <span className="text-sm text-foreground mt-0.5 sm:mt-0">{idProof.id_type}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-input">
              <span className="text-sm text-muted-foreground sm:w-48 sm:flex-shrink-0">ID Number</span>
              <span className="text-sm text-foreground mt-0.5 sm:mt-0 font-mono">
                {maskIdNumber(idProof.id_number)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start py-2">
              <span className="text-sm text-muted-foreground sm:w-48 sm:flex-shrink-0">Document</span>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Document uploaded</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
