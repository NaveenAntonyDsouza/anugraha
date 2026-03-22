"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubmitStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubmitStoryModal({ open, onClose }: SubmitStoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    coupleNames: "",
    weddingDate: "",
    location: "",
    story: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.coupleNames.trim() || !form.story.trim()) {
      toast.error("Please fill in your names and story.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couple_names: form.coupleNames.trim(),
          wedding_date: form.weddingDate || null,
          location: form.location.trim() || null,
          story: form.story.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit story");
      }

      toast.success("Thank you! Your story will appear after review.");
      setForm({ coupleNames: "", weddingDate: "", location: "", story: "" });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-bold">
          Share Your Success Story
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="coupleNames">
              Your Name & Partner&apos;s Name *
            </Label>
            <Input
              id="coupleNames"
              placeholder="e.g. Rahul & Priya"
              value={form.coupleNames}
              onChange={(e) => updateField("coupleNames", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="weddingDate">Wedding Date</Label>
            <Input
              id="weddingDate"
              type="date"
              value={form.weddingDate}
              onChange={(e) => updateField("weddingDate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="location">City / Location</Label>
            <Input
              id="location"
              placeholder="e.g. Bengaluru"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="story">How did you meet? *</Label>
            <Textarea
              id="story"
              placeholder="Tell us your story..."
              rows={4}
              value={form.story}
              onChange={(e) => updateField("story", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
