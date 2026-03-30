"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  CreditCard,
  Printer,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileCompletionBar } from "@/components/onboarding/profile-completion-bar";
import {
  ForwardProfileDropdown,
  ForwardProfileByMailModal,
} from "./forward-profile-modal";

interface ProfileData {
  id: string;
  full_name: string;
  anugraha_id: string;
  profile_completion_pct: number;
  is_verified: boolean;
  id_proof_verified: boolean;
  photo_url: string | null;
}

export function ProfileSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const authProfile = useAuthStore((s: any) => s.profile);
  const authLoading = useAuthStore((s: any) => s.isLoading);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [mobileVerified, setMobileVerified] = useState(true);
  const [showMailModal, setShowMailModal] = useState(false);

  useEffect(() => {
    if (authLoading || !authProfile) return;

    async function load() {
      const [photoRes, profileRes] = await Promise.all([
        supabase
          .from("profile_photos")
          .select("photo_url")
          .eq("profile_id", authProfile.id)
          .eq("is_primary", true)
          .eq("is_visible", true)
          .single(),
        supabase
          .from("profiles")
          .select("is_verified, id_proof_verified")
          .eq("id", authProfile.id)
          .single(),
      ]);

      setProfile({
        id: authProfile.id,
        full_name: authProfile.full_name,
        anugraha_id: authProfile.anugraha_id,
        profile_completion_pct: authProfile.profile_completion_pct,
        is_verified: profileRes.data?.is_verified ?? false,
        id_proof_verified: profileRes.data?.id_proof_verified ?? false,
        photo_url: photoRes.data?.photo_url || null,
      });
      setMobileVerified(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authProfile, authLoading]);

  if (!profile) return null;

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/view-full-profile/${profile.anugraha_id}`
      : "";

  const sidebarLinks = [
    {
      label: "Manage Photo",
      href: "/my-home/view-and-edit/manage-photos",
      icon: Camera,
    },
    {
      label: "View ID Proof",
      href: "/my-home/view-and-edit/id-proof",
      icon: CreditCard,
    },
    {
      label: "Print Profile",
      href: "/print-self-profile",
      icon: Printer,
    },
    {
      label: "Profile Preview",
      href: "/my-profile-preview",
      icon: Eye,
    },
  ];

  return (
    <>
      <aside className="w-full lg:w-[260px] flex-shrink-0">
        <div className="bg-white rounded-lg border border-input p-4 sticky top-4">
          {/* Photo */}
          <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-muted border-2 border-input">
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {profile.full_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name & ID */}
          <h3 className="text-sm font-semibold text-foreground text-center">
            {profile.full_name}
          </h3>
          <p className="text-sm font-bold text-primary text-center mb-2">
            {profile.anugraha_id}
          </p>

          {/* Verification badges */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-1.5 text-xs">
              {profile.id_proof_verified ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--success)]" />
                  <span className="text-[var(--success)]">ID Proof Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ID Proof Not Verified</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {mobileVerified ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--success)]" />
                  <span className="text-[var(--success)]">Mobile Number Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Mobile Not Verified</span>
                </>
              )}
            </div>
          </div>

          {/* Profile completion */}
          <div className="mb-4">
            <ProfileCompletionBar percent={profile.profile_completion_pct} />
            {profile.profile_completion_pct < 100 && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                In order to complete your profile, please provide us with the
                required information.
              </p>
            )}
          </div>

          {/* Nav links */}
          <nav className="space-y-0.5">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {/* Forward Profile */}
            <ForwardProfileDropdown
              profileUrl={profileUrl}
              onMailClick={() => setShowMailModal(true)}
            />
          </nav>
        </div>
      </aside>

      {/* Forward by mail modal */}
      <ForwardProfileByMailModal
        isOpen={showMailModal}
        onClose={() => setShowMailModal(false)}
        profileId={profile.anugraha_id}
        senderName={profile.full_name}
      />
    </>
  );
}
