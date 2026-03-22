"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionEditForm } from "@/components/profile/section-edit-form";
import { ConditionalField } from "@/components/onboarding/conditional-field";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import {
  heightList,
  complexionList,
  bodyTypeList,
  physicalStatusList,
  maritalStatusList,
  familyStatusList,
  weightList,
  bloodGroupList,
  motherTongueList,
  differentlyAbledCategoryList,
} from "@/lib/reference-data";

const schema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  complexion: z.string().optional(),
  body_type: z.string().optional(),
  physical_status: z.string().optional(),
  category_differently_abled: z.array(z.string()).optional(),
  specify_differently_abled: z.string().optional(),
  describe_differently_abled: z.string().optional(),
  marital_status: z.string().min(1, "Required"),
  children_with_me: z.coerce.number().int().min(0).optional(),
  children_not_with_me: z.coerce.number().int().min(0).optional(),
  family_status: z.string().optional(),
  blood_group: z.string().optional(),
  mother_tongue: z.string().optional(),
  about_the_candidate: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export function PrimaryInfoEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      marital_status: "Unmarried",
      category_differently_abled: [],
      children_with_me: 0,
      children_not_with_me: 0,
    },
  });

  const physicalStatus = form.watch("physical_status");
  const maritalStatus = form.watch("marital_status");

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_primary_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          height: data.height ?? "",
          weight: data.weight ?? "",
          complexion: data.complexion ?? "",
          body_type: data.body_type ?? "",
          physical_status: data.physical_status ?? "Normal",
          category_differently_abled: data.category_differently_abled ?? [],
          specify_differently_abled: data.specify_differently_abled ?? "",
          describe_differently_abled: data.describe_differently_abled ?? "",
          marital_status: data.marital_status ?? "Unmarried",
          children_with_me: data.children_with_me ?? 0,
          children_not_with_me: data.children_not_with_me ?? 0,
          family_status: data.family_status ?? "",
          blood_group: data.blood_group ?? "",
          mother_tongue: data.mother_tongue ?? "",
          about_the_candidate: data.about_the_candidate ?? "",
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
    const payload: Record<string, unknown> = {
      profile_id: profile.id,
      ...values,
    };

    // Clear conditional fields
    if (values.physical_status !== "Differently Abled") {
      payload.category_differently_abled = null;
      payload.specify_differently_abled = null;
      payload.describe_differently_abled = null;
    }
    if (values.marital_status === "Unmarried") {
      payload.children_with_me = 0;
      payload.children_not_with_me = 0;
    }

    const { error } = await supabase
      .from("profile_primary_info")
      .upsert(payload, { onConflict: "profile_id" });

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase
      .from("profiles")
      .update({ profile_completion_pct: pct })
      .eq("id", profile.id);

    toast.success("Primary information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/primary-info");
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
      title="Edit Primary Information"
      breadcrumb="Primary Information"
      cancelHref="/my-home/view-and-edit/primary-info"
      saving={saving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Height</label>
          <select {...form.register("height")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Height</option>
            {heightList.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Weight</label>
          <select {...form.register("weight")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Weight</option>
            {weightList.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Complexion</label>
          <select {...form.register("complexion")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Complexion</option>
            {complexionList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Body Type</label>
          <select {...form.register("body_type")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Body Type</option>
            {bodyTypeList.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Physical Status</label>
          <select {...form.register("physical_status")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            {physicalStatusList.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Marital Status</label>
          <select {...form.register("marital_status")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            {maritalStatusList.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <ConditionalField condition={physicalStatus === "Differently Abled"}>
        <div className="space-y-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {differentlyAbledCategoryList.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={form.watch("category_differently_abled")?.includes(cat) ?? false}
                    onChange={(e) => {
                      const current = form.getValues("category_differently_abled") ?? [];
                      form.setValue(
                        "category_differently_abled",
                        e.target.checked
                          ? [...current, cat]
                          : current.filter((c) => c !== cat)
                      );
                    }}
                    className="rounded border-input"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Specify</label>
            <input
              {...form.register("specify_differently_abled")}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
              placeholder="Specify disability"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea
              {...form.register("describe_differently_abled")}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
              placeholder="Describe in detail"
            />
          </div>
        </div>
      </ConditionalField>

      <ConditionalField condition={maritalStatus !== "Unmarried" && !!maritalStatus}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Children With Me</label>
            <input
              type="number"
              min={0}
              {...form.register("children_with_me")}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Children Not With Me</label>
            <input
              type="number"
              min={0}
              {...form.register("children_not_with_me")}
              className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            />
          </div>
        </div>
      </ConditionalField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Family Status</label>
          <select {...form.register("family_status")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Family Status</option>
            {familyStatusList.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Blood Group</label>
          <select {...form.register("blood_group")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Blood Group</option>
            {bloodGroupList.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Mother Tongue</label>
          <select {...form.register("mother_tongue")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Mother Tongue</option>
            {motherTongueList.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground mb-1 block">About the Candidate</label>
        <textarea
          {...form.register("about_the_candidate")}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[120px]"
          placeholder="Write about yourself..."
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {form.watch("about_the_candidate")?.length ?? 0} / 2000 characters
        </p>
      </div>
    </SectionEditForm>
  );
}
