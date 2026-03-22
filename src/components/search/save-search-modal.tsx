"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { SearchFilters } from "@/lib/search/filter-types";

interface SaveSearchModalProps {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  resultCount: number;
  existingId?: string;
  existingName?: string;
}

export function SaveSearchModal({
  open,
  onClose,
  filters,
  resultCount,
  existingId,
  existingName,
}: SaveSearchModalProps) {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(existingName ?? "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      filters: filters as Record<string, unknown>,
      result_count: resultCount,
      last_run_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await supabase
        .from("saved_searches")
        .update(payload)
        .eq("id", existingId);
      if (error) {
        toast.error("Failed to update search.");
      } else {
        toast.success("Search updated successfully.");
        onClose();
      }
    } else {
      const { error } = await supabase
        .from("saved_searches")
        .insert(payload);
      if (error) {
        toast.error("Failed to save search.");
      } else {
        toast.success("Search saved successfully.");
        onClose();
      }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {existingId ? "Edit Saved Search" : "Save Search"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Search Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karnataka Engineers"
              className="w-full h-10 border border-input rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoFocus
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {resultCount} profiles match these filters
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="h-9 px-4 border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : existingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
