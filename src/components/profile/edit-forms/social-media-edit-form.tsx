"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionEditForm } from "@/components/profile/section-edit-form";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";

const urlField = z.string().max(300).optional();

const schema = z.object({
  facebook: urlField,
  instagram: urlField,
  linkedin: urlField,
  youtube: urlField,
  website: urlField,
});

type FormValues = z.infer<typeof schema>;

export function SocialMediaEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_social_media")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          facebook: data.facebook ?? "",
          instagram: data.instagram ?? "",
          linkedin: data.linkedin ?? "",
          youtube: data.youtube ?? "",
          website: data.website ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [profile, supabase, form]);

  async function onSave() {
    const valid = await form.trigger();
    if (!valid || !profile) return;
    setSaving(true);

    const values = form.getValues();
    const { error } = await supabase
      .from("profile_social_media")
      .upsert(
        { profile_id: profile.id, ...values },
        { onConflict: "profile_id" }
      );

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase.from("profiles").update({ profile_completion_pct: pct }).eq("id", profile.id);

    toast.success("Social media information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/social-media");
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
      title="Edit Social Media Information"
      breadcrumb="Social Media Information"
      cancelHref="/my-home/view-and-edit/social-media"
      saving={saving}
      onSave={onSave}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Facebook</label>
          <input
            {...form.register("facebook")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="https://facebook.com/yourprofile"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Instagram</label>
          <input
            {...form.register("instagram")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="https://instagram.com/yourprofile"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">LinkedIn</label>
          <input
            {...form.register("linkedin")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">YouTube</label>
          <input
            {...form.register("youtube")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="https://youtube.com/@yourchannel"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Website</label>
          <input
            {...form.register("website")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </SectionEditForm>
  );
}
