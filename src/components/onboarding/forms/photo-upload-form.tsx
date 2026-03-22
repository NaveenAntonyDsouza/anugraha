"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OnboardingLayout } from "../onboarding-layout";
import { AccordionSection } from "../accordion-section";
import {
  PhotoUploadGrid,
  ArchivedPhotosGrid,
  type ProfilePhoto,
} from "../photo-upload-grid";
import { useOnboardingStore } from "@/stores/onboarding-store";

type PrivacyLevel =
  | "Visible To All"
  | "Visible To Interest Sent or Accepted"
  | "Hide Photos";

export function PhotoUploadForm() {
  const router = useRouter();
  const supabase = createClient();
  const setCompletion = useOnboardingStore((s) => s.setCompletion);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [activeTab, setActiveTab] = useState<"photos" | "archived">("photos");

  // Privacy settings
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>("Visible To All");
  const [hideAllPhotos, setHideAllPhotos] = useState(false);
  const [hideAlbumPhotos, setHideAlbumPhotos] = useState(false);
  const [hideFamilyPhotos, setHideFamilyPhotos] = useState(false);

  const profilePhotos = photos.filter(
    (p) => p.photo_type === "profile" && p.is_visible
  );
  const albumPhotos = photos.filter(
    (p) => p.photo_type === "album" && p.is_visible
  );
  const familyPhotos = photos.filter(
    (p) => p.photo_type === "family" && p.is_visible
  );
  const archivedPhotos = photos.filter((p) => !p.is_visible);

  const hasProfilePhoto = profilePhotos.length > 0;

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

      // Load photos
      const { data: existingPhotos } = await supabase
        .from("profile_photos")
        .select("*")
        .eq("profile_id", profile.id)
        .order("display_order", { ascending: true });

      if (existingPhotos) {
        setPhotos(existingPhotos as ProfilePhoto[]);
      }

      // Load privacy settings
      const { data: privacy } = await supabase
        .from("photo_privacy_settings")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (privacy) {
        setPrivacyLevel(privacy.privacy_level as PrivacyLevel);
        setHideAllPhotos(privacy.hide_all_photos ?? false);
        setHideAlbumPhotos(privacy.hide_album_photos ?? false);
        setHideFamilyPhotos(privacy.hide_family_photos ?? false);
      }

      setLoading(false);
    }
    load();
  }, [supabase, router, setCompletion]);

  const handleUploadComplete = useCallback(
    (photo: ProfilePhoto) => {
      setPhotos((prev) => [...prev, photo]);
    },
    []
  );

  const handleDelete = useCallback((photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, is_visible: false } : p))
    );
  }, []);

  const handleRestore = useCallback((photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, is_visible: true } : p))
    );
  }, []);

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      // Update local state
      setPhotos((prev) => {
        const photoMap = new Map(prev.map((p) => [p.id, p]));
        const reordered = orderedIds
          .map((id, idx) => {
            const photo = photoMap.get(id);
            if (!photo) return null;
            return { ...photo, display_order: idx };
          })
          .filter(Boolean) as ProfilePhoto[];
        // Keep non-reordered photos
        const otherPhotos = prev.filter((p) => !orderedIds.includes(p.id));
        return [...reordered, ...otherPhotos];
      });

      // Update DB
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from("profile_photos")
          .update({ display_order: i })
          .eq("id", orderedIds[i]);
      }
    },
    [supabase]
  );

  async function savePrivacy() {
    if (!profileId) return;
    setSavingPrivacy(true);
    try {
      const { error } = await supabase.from("photo_privacy_settings").upsert(
        {
          profile_id: profileId,
          privacy_level: privacyLevel,
          hide_all_photos: privacyLevel === "Hide Photos" ? hideAllPhotos : false,
          hide_album_photos: privacyLevel === "Hide Photos" ? hideAlbumPhotos : false,
          hide_family_photos: privacyLevel === "Hide Photos" ? hideFamilyPhotos : false,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      toast.success("Privacy settings saved");
    } catch {
      toast.error("Failed to save privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  }

  async function handleSaveAndContinue() {
    setNavigating(true);
    try {
      await savePrivacy();

      // Update profile completion
      if (profileId && hasProfilePhoto) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("profile_completion_pct")
          .eq("id", profileId)
          .single();
        if (profile) {
          const newPct = Math.min(Math.max(profile.profile_completion_pct ?? 40, 60), 100);
          await supabase
            .from("profiles")
            .update({ profile_completion_pct: newPct })
            .eq("id", profileId);
          setCompletion(newPct);
        }
      }

      router.push("/submit-id-proof");
    } catch {
      toast.error("Something went wrong");
      setNavigating(false);
    }
  }

  if (loading) {
    return (
      <OnboardingLayout currentStep={4}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={4}>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "photos"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "archived"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Archived ({archivedPhotos.length})
        </button>
      </div>

      {activeTab === "photos" ? (
        <div className="space-y-4">
          {/* Profile Photo */}
          <AccordionSection
            title="Profile Photo"
            isComplete={hasProfilePhoto}
            defaultOpen={true}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Upload a clear photo of yourself. This will be your primary
                profile photo.
              </p>
              {profileId && (
                <PhotoUploadGrid
                  type="profile"
                  maxPhotos={1}
                  profileId={profileId}
                  existingPhotos={profilePhotos}
                  onUploadComplete={handleUploadComplete}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </AccordionSection>

          {/* Photo Privacy */}
          <AccordionSection title="Photo Privacy Setting">
            <div className="space-y-3">
              {(
                [
                  "Visible To All",
                  "Visible To Interest Sent or Accepted",
                  "Hide Photos",
                ] as const
              ).map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={privacyLevel === level}
                    onChange={() => setPrivacyLevel(level)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}

              {privacyLevel === "Hide Photos" && (
                <div className="ml-6 space-y-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideAllPhotos}
                      onChange={(e) => setHideAllPhotos(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Hide all photos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideAlbumPhotos}
                      onChange={(e) => setHideAlbumPhotos(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Hide album photos only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideFamilyPhotos}
                      onChange={(e) => setHideFamilyPhotos(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Hide family/group photos only</span>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={savePrivacy}
                disabled={savingPrivacy}
                className="mt-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingPrivacy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </AccordionSection>

          {/* Album Photos */}
          <AccordionSection
            title="Album Photos"
            isComplete={albumPhotos.length > 0}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Upload up to 9 photos. Drag to reorder.
              </p>
              {profileId && (
                <PhotoUploadGrid
                  type="album"
                  maxPhotos={9}
                  profileId={profileId}
                  existingPhotos={albumPhotos}
                  onUploadComplete={handleUploadComplete}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              )}
            </div>
          </AccordionSection>

          {/* Family/Group Photos */}
          <AccordionSection
            title="Family / Group Photos"
            isComplete={familyPhotos.length > 0}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Upload up to 3 family or group photos.
              </p>
              {profileId && (
                <PhotoUploadGrid
                  type="family"
                  maxPhotos={3}
                  profileId={profileId}
                  existingPhotos={familyPhotos}
                  onUploadComplete={handleUploadComplete}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              )}
            </div>
          </AccordionSection>
        </div>
      ) : (
        /* Archived Tab */
        <div className="bg-white rounded-lg border border-input p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Archived Photos
          </h3>
          <ArchivedPhotosGrid photos={archivedPhotos} onRestore={handleRestore} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => router.push("/submit-id-proof")}
          className="h-11 px-6 border border-input text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={navigating}
          className="h-11 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {navigating && <Loader2 className="h-4 w-4 animate-spin" />}
          Save &amp; Continue
        </button>
      </div>
    </OnboardingLayout>
  );
}
