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
  religionList,
  denominationList,
  dioceseList,
  casteList,
  subCasteList,
  raasiList,
  nakshatraList,
  gothramList,
  manglikList,
  muslimSectList,
  jamathList,
  jainSectList,
} from "@/lib/reference-data";

const schema = z.object({
  religion: z.string().min(1, "Religion is required"),
  other_religion_name: z.string().optional(),
  denomination: z.string().optional(),
  diocese: z.string().optional(),
  diocese_name: z.string().optional(),
  parish_name_place: z.string().optional(),
  caste_community: z.string().optional(),
  sub_caste_community: z.string().optional(),
  time_of_birth: z.string().optional(),
  place_of_birth: z.string().optional(),
  rasi: z.string().optional(),
  nakshatra: z.string().optional(),
  gothram: z.string().optional(),
  manglik: z.string().optional(),
  muslim_sect: z.string().optional(),
  muslim_community: z.string().optional(),
  religious_observance: z.string().optional(),
  jain_sect: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ReligiousInfoEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { religion: "" },
  });

  const religion = form.watch("religion");
  const diocese = form.watch("diocese");

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_religious_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          religion: data.religion ?? "",
          other_religion_name: data.other_religion_name ?? "",
          denomination: data.denomination ?? "",
          diocese: data.diocese ?? "",
          diocese_name: data.diocese_name ?? "",
          parish_name_place: data.parish_name_place ?? "",
          caste_community: data.caste_community ?? "",
          sub_caste_community: data.sub_caste_community ?? "",
          time_of_birth: data.time_of_birth ?? "",
          place_of_birth: data.place_of_birth ?? "",
          rasi: data.rasi ?? "",
          nakshatra: data.nakshatra ?? "",
          gothram: data.gothram ?? "",
          manglik: data.manglik ?? "",
          muslim_sect: data.muslim_sect ?? "",
          muslim_community: data.muslim_community ?? "",
          religious_observance: data.religious_observance ?? "",
          jain_sect: data.jain_sect ?? "",
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
      religion: values.religion,
    };

    // Only include religion-specific fields
    if (values.religion === "Other") {
      payload.other_religion_name = values.other_religion_name;
    }
    if (values.religion === "Christian") {
      payload.denomination = values.denomination;
      payload.diocese = values.diocese;
      payload.diocese_name = values.diocese === "Other" ? values.diocese_name : null;
      payload.parish_name_place = values.parish_name_place;
    }
    if (values.religion === "Hindu" || values.religion === "Jain") {
      payload.caste_community = values.caste_community;
      payload.sub_caste_community = values.sub_caste_community;
      payload.time_of_birth = values.time_of_birth || null;
      payload.place_of_birth = values.place_of_birth;
      payload.rasi = values.rasi;
      payload.nakshatra = values.nakshatra;
      payload.gothram = values.gothram;
    }
    if (values.religion === "Hindu") {
      payload.manglik = values.manglik;
    }
    if (values.religion === "Jain") {
      payload.jain_sect = values.jain_sect;
    }
    if (values.religion === "Muslim") {
      payload.muslim_sect = values.muslim_sect;
      payload.muslim_community = values.muslim_community;
      payload.religious_observance = values.religious_observance;
    }

    // Clear incompatible fields
    if (values.religion !== "Christian") {
      payload.denomination = null;
      payload.diocese = null;
      payload.diocese_name = null;
      payload.parish_name_place = null;
    }
    if (values.religion !== "Hindu" && values.religion !== "Jain") {
      payload.caste_community = null;
      payload.sub_caste_community = null;
      payload.time_of_birth = null;
      payload.place_of_birth = null;
      payload.rasi = null;
      payload.nakshatra = null;
      payload.gothram = null;
    }
    if (values.religion !== "Hindu") {
      payload.manglik = null;
    }
    if (values.religion !== "Jain") {
      payload.jain_sect = null;
    }
    if (values.religion !== "Muslim") {
      payload.muslim_sect = null;
      payload.muslim_community = null;
      payload.religious_observance = null;
    }
    if (values.religion !== "Other") {
      payload.other_religion_name = null;
    }

    const { error } = await supabase
      .from("profile_religious_info")
      .upsert(payload, { onConflict: "profile_id" });

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase.from("profiles").update({ profile_completion_pct: pct }).eq("id", profile.id);

    toast.success("Religious information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/religious-info");
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
      title="Edit Religious Information"
      breadcrumb="Religious Information"
      cancelHref="/my-home/view-and-edit/religious-info"
      saving={saving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Religion *</label>
          <select {...form.register("religion")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select Religion</option>
            {religionList.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {form.formState.errors.religion && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.religion.message}</p>
          )}
        </div>
      </div>

      <ConditionalField condition={religion === "Other"}>
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground mb-1 block">Other Religion Name</label>
          <input {...form.register("other_religion_name")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
        </div>
      </ConditionalField>

      <ConditionalField condition={religion === "Christian"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Denomination</label>
            <select {...form.register("denomination")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Denomination</option>
              {denominationList.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Diocese</label>
            <select {...form.register("diocese")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Diocese</option>
              {dioceseList.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {diocese === "Other" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Diocese Name</label>
              <input {...form.register("diocese_name")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1 block">Parish / Place</label>
            <input {...form.register("parish_name_place")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
          </div>
        </div>
      </ConditionalField>

      <ConditionalField condition={religion === "Hindu" || religion === "Jain"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Caste / Community</label>
            <select {...form.register("caste_community")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Caste</option>
              {casteList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Sub-Caste</label>
            <select {...form.register("sub_caste_community")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Sub-Caste</option>
              {subCasteList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Time of Birth</label>
            <input type="time" {...form.register("time_of_birth")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Place of Birth</label>
            <input {...form.register("place_of_birth")} className="w-full h-10 border border-input rounded-lg px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Rasi</label>
            <select {...form.register("rasi")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Rasi</option>
              {raasiList.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nakshatra</label>
            <select {...form.register("nakshatra")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Nakshatra</option>
              {nakshatraList.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Gothram</label>
            <select {...form.register("gothram")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Gothram</option>
              {gothramList.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {religion === "Hindu" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Manglik</label>
              <select {...form.register("manglik")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
                <option value="">Select</option>
                {manglikList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          {religion === "Jain" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Jain Sect</label>
              <select {...form.register("jain_sect")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
                <option value="">Select Jain Sect</option>
                {jainSectList.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          )}
        </div>
      </ConditionalField>

      <ConditionalField condition={religion === "Muslim"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Muslim Sect</label>
            <select {...form.register("muslim_sect")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Sect</option>
              {muslimSectList.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Community / Jamath</label>
            <select {...form.register("muslim_community")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select Community</option>
              {jamathList.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Religious Observance</label>
            <select {...form.register("religious_observance")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
              <option value="">Select</option>
              <option value="Practicing">Practicing</option>
              <option value="Moderately Practicing">Moderately Practicing</option>
              <option value="Non-practicing">Non-practicing</option>
              <option value="Prefer Not to Say">Prefer Not to Say</option>
            </select>
          </div>
        </div>
      </ConditionalField>
    </SectionEditForm>
  );
}
