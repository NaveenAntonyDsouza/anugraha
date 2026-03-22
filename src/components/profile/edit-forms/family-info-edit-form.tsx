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

const schema = z.object({
  father_name: z.string().max(200).optional(),
  father_house_name: z.string().max(200).optional(),
  father_native_place: z.string().max(200).optional(),
  father_occupation: z.string().max(200).optional(),
  mother_name: z.string().max(200).optional(),
  mother_house_name: z.string().max(200).optional(),
  mother_native_place: z.string().max(200).optional(),
  mother_occupation: z.string().max(200).optional(),
  candidate_asset_details: z.string().optional(),
  about_candidate_family: z.string().optional(),
  brothers_married: z.number().int().min(0).optional(),
  brothers_unmarried: z.number().int().min(0).optional(),
  brothers_priest: z.number().int().min(0).optional(),
  sisters_married: z.number().int().min(0).optional(),
  sisters_unmarried: z.number().int().min(0).optional(),
  sisters_nun: z.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export function FamilyInfoEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brothers_married: 0,
      brothers_unmarried: 0,
      brothers_priest: 0,
      sisters_married: 0,
      sisters_unmarried: 0,
      sisters_nun: 0,
    },
  });

  useEffect(() => {
    async function load() {
      if (!profile) return;

      const [{ data: familyData }, { data: siblingData }] = await Promise.all([
        supabase
          .from("profile_family_info")
          .select("*")
          .eq("profile_id", profile.id)
          .single(),
        supabase
          .from("profile_sibling_info")
          .select("*")
          .eq("profile_id", profile.id)
          .single(),
      ]);

      form.reset({
        father_name: familyData?.father_name ?? "",
        father_house_name: familyData?.father_house_name ?? "",
        father_native_place: familyData?.father_native_place ?? "",
        father_occupation: familyData?.father_occupation ?? "",
        mother_name: familyData?.mother_name ?? "",
        mother_house_name: familyData?.mother_house_name ?? "",
        mother_native_place: familyData?.mother_native_place ?? "",
        mother_occupation: familyData?.mother_occupation ?? "",
        candidate_asset_details: familyData?.candidate_asset_details ?? "",
        about_candidate_family: familyData?.about_candidate_family ?? "",
        brothers_married: siblingData?.brothers_married ?? 0,
        brothers_unmarried: siblingData?.brothers_unmarried ?? 0,
        brothers_priest: siblingData?.brothers_priest ?? 0,
        sisters_married: siblingData?.sisters_married ?? 0,
        sisters_unmarried: siblingData?.sisters_unmarried ?? 0,
        sisters_nun: siblingData?.sisters_nun ?? 0,
      });

      setLoading(false);
    }
    load();
  }, [profile, supabase, form]);

  async function onSave() {
    const valid = await form.trigger();
    if (!valid || !profile) return;
    setSaving(true);

    const values = form.getValues();

    const familyPayload = {
      profile_id: profile.id,
      father_name: values.father_name,
      father_house_name: values.father_house_name,
      father_native_place: values.father_native_place,
      father_occupation: values.father_occupation,
      mother_name: values.mother_name,
      mother_house_name: values.mother_house_name,
      mother_native_place: values.mother_native_place,
      mother_occupation: values.mother_occupation,
      candidate_asset_details: values.candidate_asset_details,
      about_candidate_family: values.about_candidate_family,
    };

    const siblingPayload = {
      profile_id: profile.id,
      brothers_married: values.brothers_married,
      brothers_unmarried: values.brothers_unmarried,
      brothers_priest: values.brothers_priest,
      sisters_married: values.sisters_married,
      sisters_unmarried: values.sisters_unmarried,
      sisters_nun: values.sisters_nun,
    };

    const [{ error: familyError }, { error: siblingError }] = await Promise.all([
      supabase
        .from("profile_family_info")
        .upsert(familyPayload, { onConflict: "profile_id" }),
      supabase
        .from("profile_sibling_info")
        .upsert(siblingPayload, { onConflict: "profile_id" }),
    ]);

    if (familyError || siblingError) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase
      .from("profiles")
      .update({ profile_completion_pct: pct })
      .eq("id", profile.id);

    toast.success("Family information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/family-info");
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
      title="Edit Family Information"
      breadcrumb="Family Information"
      cancelHref="/my-home/view-and-edit/family-info"
      saving={saving}
      onSave={onSave}
    >
      {/* Father's Details */}
      <h3 className="text-sm font-semibold text-foreground">Father&apos;s Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Father&apos;s Name</label>
          <input
            {...form.register("father_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter father's name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">House Name</label>
          <input
            {...form.register("father_house_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter house name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Native Place</label>
          <input
            {...form.register("father_native_place")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter native place"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Occupation</label>
          <input
            {...form.register("father_occupation")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter occupation"
          />
        </div>
      </div>

      <hr className="border-border my-6" />

      {/* Mother's Details */}
      <h3 className="text-sm font-semibold text-foreground">Mother&apos;s Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Mother&apos;s Name</label>
          <input
            {...form.register("mother_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter mother's name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">House Name</label>
          <input
            {...form.register("mother_house_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter house name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Native Place</label>
          <input
            {...form.register("mother_native_place")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter native place"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Occupation</label>
          <input
            {...form.register("mother_occupation")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Enter occupation"
          />
        </div>
      </div>

      <hr className="border-border my-6" />

      {/* Asset & About Family */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Asset Details</label>
          <textarea
            {...form.register("candidate_asset_details")}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
            placeholder="Describe asset details..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">About Family</label>
          <textarea
            {...form.register("about_candidate_family")}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
            placeholder="Write about your family..."
          />
        </div>
      </div>

      <hr className="border-border my-6" />

      {/* Sibling Counts */}
      <h3 className="text-sm font-semibold text-foreground">Sibling Details</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Brothers Married</label>
          <input
            type="number"
            min={0}
            {...form.register("brothers_married", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Brothers Unmarried</label>
          <input
            type="number"
            min={0}
            {...form.register("brothers_unmarried", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Brothers Priest</label>
          <input
            type="number"
            min={0}
            {...form.register("brothers_priest", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Sisters Married</label>
          <input
            type="number"
            min={0}
            {...form.register("sisters_married", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Sisters Unmarried</label>
          <input
            type="number"
            min={0}
            {...form.register("sisters_unmarried", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Sisters Nun</label>
          <input
            type="number"
            min={0}
            {...form.register("sisters_nun", { valueAsNumber: true })}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
          />
        </div>
      </div>
    </SectionEditForm>
  );
}
