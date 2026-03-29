"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  PhotoUploadGrid,
  ArchivedPhotosGrid,
  type ProfilePhoto,
} from "@/components/onboarding/photo-upload-grid";

type PrivacyLevel =
  | "Visible To All"
  | "Visible To Interest Sent or Accepted"
  | "Hide Photos";

export default function ManagePhotosPage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Photos
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhoto[]>([]);
  const [albumPhotos, setAlbumPhotos] = useState<ProfilePhoto[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<ProfilePhoto[]>([]);
  const [archivedPhotos, setArchivedPhotos] = useState<ProfilePhoto[]>([]);

  // Privacy
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>("Visible To All");
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [showAlbumPhotos, setShowAlbumPhotos] = useState(true);
  const [showFamilyPhotos, setShowFamilyPhotos] = useState(true);

  const [activeTab, setActiveTab] = useState<"photos" | "archived">("photos");

  const authLoading = useAuthStore((s) => s.isLoading);

  const loadPhotos = useCallback(async () => {
    if (!profile) {
      if (!authLoading) setLoading(false);
      return;
    }
    setProfileId(profile.id);

    const [photosRes, archivedRes, privacyRes] = await Promise.all([
      supabase
        .from("profile_photos")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("is_visible", true)
        .order("display_order"),
      supabase
        .from("profile_photos")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("is_visible", false),
      supabase
        .from("photo_privacy_settings")
        .select("*")
        .eq("profile_id", profile.id)
        .single(),
    ]);

    if (photosRes.data) {
      setProfilePhotos(photosRes.data.filter((p) => p.photo_type === "profile"));
      setAlbumPhotos(photosRes.data.filter((p) => p.photo_type === "album"));
      setFamilyPhotos(photosRes.data.filter((p) => p.photo_type === "family"));
    }
    if (archivedRes.data) setArchivedPhotos(archivedRes.data);
    if (privacyRes.data) {
      setPrivacyLevel(privacyRes.data.privacy_level ?? "Visible To All");
      setShowProfilePhoto(privacyRes.data.show_profile_photo ?? true);
      setShowAlbumPhotos(privacyRes.data.show_album_photos ?? true);
      setShowFamilyPhotos(privacyRes.data.show_family_photos ?? true);
    }
    setLoading(false);
  }, [profile, authLoading, supabase]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  function handleUploadComplete(
    photo: ProfilePhoto,
    setter: React.Dispatch<React.SetStateAction<ProfilePhoto[]>>
  ) {
    setter((prev) => [...prev, photo]);
  }

  function handleDelete(
    photoId: string,
    setter: React.Dispatch<React.SetStateAction<ProfilePhoto[]>>
  ) {
    setter((prev) => {
      const deleted = prev.find((p) => p.id === photoId);
      if (deleted) {
        setArchivedPhotos((a) => [...a, { ...deleted, is_visible: false }]);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }

  function handleRestore(photoId: string) {
    const restored = archivedPhotos.find((p) => p.id === photoId);
    if (!restored) return;
    setArchivedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    const restoredPhoto = { ...restored, is_visible: true };
    if (restored.photo_type === "profile") {
      setProfilePhotos((prev) => [...prev, restoredPhoto]);
    } else if (restored.photo_type === "album") {
      setAlbumPhotos((prev) => [...prev, restoredPhoto]);
    } else {
      setFamilyPhotos((prev) => [...prev, restoredPhoto]);
    }
  }

  async function savePrivacy() {
    if (!profileId) return;
    setSavingPrivacy(true);
    const { error } = await supabase.from("photo_privacy_settings").upsert(
      {
        profile_id: profileId,
        privacy_level: privacyLevel,
        show_profile_photo: showProfilePhoto,
        show_album_photos: showAlbumPhotos,
        show_family_photos: showFamilyPhotos,
      },
      { onConflict: "profile_id" }
    );
    if (error) {
      toast.error("Failed to save privacy settings.");
    } else {
      toast.success("Privacy settings saved.");
    }
    setSavingPrivacy(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Manage Photos</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-input">
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "photos"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "archived"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Archived ({archivedPhotos.length})
        </button>
      </div>

      {activeTab === "photos" ? (
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg border border-input p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Profile Photo</h3>
            {profileId && (
              <PhotoUploadGrid
                type="profile"
                profileId={profileId}
                existingPhotos={profilePhotos}
                maxPhotos={1}
                onUploadComplete={(photo) => handleUploadComplete(photo, setProfilePhotos)}
                onDelete={(id) => handleDelete(id, setProfilePhotos)}
              />
            )}
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg border border-input p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Photo Privacy Setting</h3>
            <div className="space-y-3">
              {(
                [
                  "Visible To All",
                  "Visible To Interest Sent or Accepted",
                  "Hide Photos",
                ] as PrivacyLevel[]
              ).map((level) => (
                <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={privacyLevel === level}
                    onChange={() => setPrivacyLevel(level)}
                    className="accent-primary"
                  />
                  {level}
                </label>
              ))}

              {privacyLevel !== "Visible To All" && (
                <div className="pl-6 space-y-2 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showProfilePhoto}
                      onChange={(e) => setShowProfilePhoto(e.target.checked)}
                      className="rounded border-input"
                    />
                    Show Profile Photo
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showAlbumPhotos}
                      onChange={(e) => setShowAlbumPhotos(e.target.checked)}
                      className="rounded border-input"
                    />
                    Show Album Photos
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showFamilyPhotos}
                      onChange={(e) => setShowFamilyPhotos(e.target.checked)}
                      className="rounded border-input"
                    />
                    Show Family Photos
                  </label>
                </div>
              )}

              <button
                onClick={savePrivacy}
                disabled={savingPrivacy}
                className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mt-3"
              >
                {savingPrivacy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Privacy Settings
              </button>
            </div>
          </div>

          {/* Album */}
          <div className="bg-white rounded-lg border border-input p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Album Photos ({albumPhotos.length}/9)
            </h3>
            {profileId && (
              <PhotoUploadGrid
                type="album"
                profileId={profileId}
                existingPhotos={albumPhotos}
                maxPhotos={9}
                onUploadComplete={(photo) => handleUploadComplete(photo, setAlbumPhotos)}
                onDelete={(id) => handleDelete(id, setAlbumPhotos)}
              />
            )}
          </div>

          {/* Family */}
          <div className="bg-white rounded-lg border border-input p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Family Photos ({familyPhotos.length}/3)
            </h3>
            {profileId && (
              <PhotoUploadGrid
                type="family"
                profileId={profileId}
                existingPhotos={familyPhotos}
                maxPhotos={3}
                onUploadComplete={(photo) => handleUploadComplete(photo, setFamilyPhotos)}
                onDelete={(id) => handleDelete(id, setFamilyPhotos)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-input p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Archived Photos</h3>
          {archivedPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No archived photos.
            </p>
          ) : (
            <ArchivedPhotosGrid
              photos={archivedPhotos}
              onRestore={handleRestore}
            />
          )}
        </div>
      )}
    </div>
  );
}
