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
  educationalQualificationsList,
  educationLevelList,
  occupationCategoryList,
  employmentCategoryList,
  annualIncomeList,
  countryList,
  indianStateList,
  karnatakaDistrictList,
} from "@/lib/reference-data";

const schema = z.object({
  educational_qualifications: z.string().optional(),
  education_level: z.string().optional(),
  occupation_category: z.string().optional(),
  employment_category: z.string().optional(),
  working_country: z.string().optional(),
  working_state: z.string().optional(),
  working_district: z.string().optional(),
  annual_income: z.string().optional(),
  education_in_detail: z.string().optional(),
  occupation_in_detail: z.string().optional(),
  organization_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EducationProfessionEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const workingCountry = form.watch("working_country");
  const workingState = form.watch("working_state");

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_education_profession")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          educational_qualifications: data.educational_qualifications ?? "",
          education_level: data.education_level ?? "",
          occupation_category: data.occupation_category ?? "",
          employment_category: data.employment_category ?? "",
          working_country: data.working_country ?? "",
          working_state: data.working_state ?? "",
          working_district: data.working_district ?? "",
          annual_income: data.annual_income ?? "",
          education_in_detail: data.education_in_detail ?? "",
          occupation_in_detail: data.occupation_in_detail ?? "",
          organization_name: data.organization_name ?? "",
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
    if (values.working_country !== "India") {
      payload.working_state = null;
      payload.working_district = null;
    }
    if (values.working_state !== "Karnataka") {
      payload.working_district = null;
    }

    const { error } = await supabase
      .from("profile_education_profession")
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

    toast.success("Education & profession saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/education-profession");
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
      title="Edit Education & Profession"
      breadcrumb="Education & Profession"
      cancelHref="/my-home/view-and-edit/education-profession"
      saving={saving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Educational Qualifications</label>
          <select {...form.register("educational_qualifications")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Qualification</option>
            {educationalQualificationsList.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Education Level</label>
          <select {...form.register("education_level")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Education Level</option>
            {educationLevelList.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Occupation Category</label>
          <select {...form.register("occupation_category")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Occupation</option>
            {occupationCategoryList.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Employment Category</label>
          <select {...form.register("employment_category")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Employment</option>
            {employmentCategoryList.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Working Country</label>
          <select {...form.register("working_country")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Country</option>
            {countryList.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Annual Income</label>
          <select {...form.register("annual_income")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Income</option>
            {annualIncomeList.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <ConditionalField condition={workingCountry === "India"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Working State</label>
            <select {...form.register("working_state")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select State</option>
              {indianStateList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <ConditionalField condition={!!workingState}>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Working District</label>
              {workingState === "Karnataka" ? (
                <select {...form.register("working_district")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
                  <option value="">Select District</option>
                  {karnatakaDistrictList.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input
                  {...form.register("working_district")}
                  className="w-full h-10 border border-input rounded-lg px-3 text-sm"
                  placeholder="Enter district"
                />
              )}
            </div>
          </ConditionalField>
        </div>
      </ConditionalField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground mb-1 block">Organization Name</label>
          <input
            {...form.register("organization_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter organization name"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground mb-1 block">Education in Detail</label>
        <textarea
          {...form.register("education_in_detail")}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
          placeholder="Describe your education in detail..."
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground mb-1 block">Occupation in Detail</label>
        <textarea
          {...form.register("occupation_in_detail")}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
          placeholder="Describe your occupation in detail..."
        />
      </div>
    </SectionEditForm>
  );
}
