"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CldUploadWidget } from "next-cloudinary";
import { Loader2, Trash2, Upload, GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface ProfilePhoto {
  id: string;
  profile_id: string;
  photo_type: "profile" | "album" | "family";
  photo_url: string;
  cloudinary_public_id: string | null;
  thumbnail_url: string | null;
  is_primary: boolean;
  is_visible: boolean;
  display_order: number;
}

interface CloudinaryResult {
  info: {
    public_id: string;
    secure_url: string;
    thumbnail_url: string;
  };
}

interface PhotoUploadGridProps {
  type: "profile" | "album" | "family";
  maxPhotos: number;
  profileId: string;
  existingPhotos: ProfilePhoto[];
  onUploadComplete: (photo: ProfilePhoto) => void;
  onDelete: (photoId: string) => void;
  onReorder?: (orderedIds: string[]) => void;
}

export function PhotoUploadGrid({
  type,
  maxPhotos,
  profileId,
  existingPhotos,
  onUploadComplete,
  onDelete,
  onReorder,
}: PhotoUploadGridProps) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const visiblePhotos = existingPhotos.filter((p) => p.is_visible);
  const canUpload = visiblePhotos.length < maxPhotos;

  const handleUploadSuccess = useCallback(
    async (result: CloudinaryResult) => {
      const { info } = result;
      const { data, error } = await supabase
        .from("profile_photos")
        .insert({
          profile_id: profileId,
          photo_type: type,
          photo_url: info.secure_url,
          cloudinary_public_id: info.public_id,
          thumbnail_url: info.thumbnail_url,
          is_primary: type === "profile",
          display_order: visiblePhotos.length,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to save photo");
        return;
      }
      if (data) {
        onUploadComplete(data as ProfilePhoto);
        toast.success("Photo uploaded");
      }
    },
    [supabase, profileId, type, visiblePhotos.length, onUploadComplete]
  );

  async function handleDelete(photoId: string) {
    setDeleting(photoId);
    try {
      const { error } = await supabase
        .from("profile_photos")
        .update({ is_visible: false })
        .eq("id", photoId);

      if (error) throw error;
      onDelete(photoId);
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    } finally {
      setDeleting(null);
    }
  }

  function handleDragStart(photoId: string) {
    setDraggedId(photoId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || !onReorder) return;

    const ids = visiblePhotos.map((p) => p.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, draggedId);
    onReorder(newIds);
    setDraggedId(null);
  }

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "anugraha_unsigned";

  return (
    <div>
      <div
        className={cn(
          "grid gap-3",
          type === "profile"
            ? "grid-cols-1 max-w-[200px]"
            : "grid-cols-3 sm:grid-cols-4"
        )}
      >
        {/* Existing photos */}
        {visiblePhotos.map((photo) => (
          <div
            key={photo.id}
            draggable={type !== "profile" && !!onReorder}
            onDragStart={() => handleDragStart(photo.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(photo.id)}
            className={cn(
              "relative group aspect-square rounded-lg overflow-hidden border border-input bg-muted",
              draggedId === photo.id && "opacity-50"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnail_url || photo.photo_url}
              alt={`${type} photo`}
              className="w-full h-full object-cover"
            />

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {type !== "profile" && onReorder && (
                <GripVertical className="h-5 w-5 text-white cursor-grab" />
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deleting === photo.id}
                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Delete photo"
              >
                {deleting === photo.id ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-white" />
                )}
              </button>
            </div>

            {/* Primary badge */}
            {photo.is_primary && (
              <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">
                Primary
              </span>
            )}
          </div>
        ))}

        {/* Upload button */}
        {canUpload && (
          <CldUploadWidget
            uploadPreset={uploadPreset}
            options={{
              maxFiles: maxPhotos - visiblePhotos.length,
              sources: ["local", "camera"],
              resourceType: "image",
              maxFileSize: 30000000,
              cropping: type === "profile",
              croppingAspectRatio: type === "profile" ? 1 : undefined,
              croppingShowDimensions: true,
            }}
            onSuccess={(result) => handleUploadSuccess(result as CloudinaryResult)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="aspect-square rounded-lg border-2 border-dashed border-input hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {visiblePhotos.length}/{maxPhotos} photos
        {type !== "profile" && " · PNG, JPG, WebP · Max 30MB total"}
      </p>
    </div>
  );
}

/* ─── Archived Photos Grid ─── */

interface ArchivedPhotosGridProps {
  photos: ProfilePhoto[];
  onRestore: (photoId: string) => void;
}

export function ArchivedPhotosGrid({ photos, onRestore }: ArchivedPhotosGridProps) {
  const supabase = createClient();
  const [restoring, setRestoring] = useState<string | null>(null);

  async function handleRestore(photoId: string) {
    setRestoring(photoId);
    try {
      const { error } = await supabase
        .from("profile_photos")
        .update({ is_visible: true })
        .eq("id", photoId);

      if (error) throw error;
      onRestore(photoId);
      toast.success("Photo restored");
    } catch {
      toast.error("Failed to restore photo");
    } finally {
      setRestoring(null);
    }
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No archived photos
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group aspect-square rounded-lg overflow-hidden border border-input bg-muted opacity-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.thumbnail_url || photo.photo_url}
            alt="Archived photo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleRestore(photo.id)}
              disabled={restoring === photo.id}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              aria-label="Restore photo"
            >
              {restoring === photo.id ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
