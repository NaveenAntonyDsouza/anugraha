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
  countryList,
  indianStateList,
  karnatakaDistrictList,
  branchList,
  residentialStatusList,
} from "@/lib/reference-data";

const schema = z.object({
  native_country: z.string().optional(),
  native_state: z.string().optional(),
  native_district: z.string().optional(),
  residing_country: z.string().optional(),
  residential_status: z.string().optional(),
  outstation_leave_date_from: z.string().optional(),
  outstation_leave_date_to: z.string().optional(),
  preferred_branch: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LocationInfoEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const nativeCountry = form.watch("native_country");
  const nativeState = form.watch("native_state");
  const residingCountry = form.watch("residing_country");

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_location_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          native_country: data.native_country ?? "",
          native_state: data.native_state ?? "",
          native_district: data.native_district ?? "",
          residing_country: data.residing_country ?? "",
          residential_status: data.residential_status ?? "",
          outstation_leave_date_from: data.outstation_leave_date_from ?? "",
          outstation_leave_date_to: data.outstation_leave_date_to ?? "",
          preferred_branch: data.preferred_branch ?? "",
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

    // Clear conditional fields when conditions don't apply
    if (values.native_country !== "India") {
      payload.native_state = null;
      payload.native_district = null;
    }
    if (values.native_country !== "India" || !values.native_state) {
      payload.native_district = null;
    }
    if (values.residing_country === "India" || !values.residing_country) {
      payload.residential_status = null;
      payload.outstation_leave_date_from = null;
      payload.outstation_leave_date_to = null;
    }

    // Clear empty date strings to null
    if (!payload.outstation_leave_date_from) payload.outstation_leave_date_from = null;
    if (!payload.outstation_leave_date_to) payload.outstation_leave_date_to = null;

    const { error } = await supabase
      .from("profile_location_info")
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

    toast.success("Location information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/location-info");
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
      title="Edit Location Information"
      breadcrumb="Location Information"
      cancelHref="/my-home/view-and-edit/location-info"
      saving={saving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Native Country</label>
          <select {...form.register("native_country")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Country</option>
            {countryList.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <ConditionalField condition={nativeCountry === "India"}>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Native State</label>
            <select {...form.register("native_state")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select State</option>
              {indianStateList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </ConditionalField>

        <ConditionalField condition={nativeCountry === "India" && !!nativeState}>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Native District</label>
            {nativeState === "Karnataka" ? (
              <select {...form.register("native_district")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
                <option value="">Select District</option>
                {karnatakaDistrictList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input {...form.register("native_district")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" placeholder="Enter district" />
            )}
          </div>
        </ConditionalField>
      </div>

      <hr className="my-6 border-border" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Residing Country</label>
          <select {...form.register("residing_country")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Country</option>
            {countryList.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <ConditionalField condition={!!residingCountry && residingCountry !== "India"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Residential Status</label>
            <select {...form.register("residential_status")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Status</option>
              {residentialStatusList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Leave Date From</label>
            <input type="date" {...form.register("outstation_leave_date_from")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Leave Date To</label>
            <input type="date" {...form.register("outstation_leave_date_to")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
          </div>
        </div>
      </ConditionalField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Preferred Branch</label>
          <select {...form.register("preferred_branch")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Branch</option>
            {branchList.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
    </SectionEditForm>
  );
}
