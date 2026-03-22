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
import { preferredCallTimeList } from "@/lib/reference-data";

const schema = z.object({
  mobile_number: z.string().min(1, "Required").max(20),
  whatsapp_number: z.string().max(20).optional(),
  custodian_name: z.string().max(200).optional(),
  custodian_relation: z.string().max(100).optional(),
  communication_address: z.string().optional(),
  pin_zip_code: z.string().max(20).optional(),
  residential_phone_number: z.string().max(20).optional(),
  secondary_mobile_number: z.string().max(20).optional(),
  preferred_call_time: z.string().max(100).optional(),
  alternate_email_id: z
    .string()
    .max(255)
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    }),
  reference_name: z.string().max(200).optional(),
  reference_relationship: z.string().max(100).optional(),
  reference_mobile: z.string().max(20).optional(),
  present_address_same_as_comm: z.boolean().optional(),
  present_address: z.string().optional(),
  present_pin_zip_code: z.string().max(20).optional(),
  permanent_address_same_as_comm: z.boolean().optional(),
  permanent_address_same_as_present: z.boolean().optional(),
  permanent_address: z.string().optional(),
  permanent_pin_zip_code: z.string().max(20).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ContactInfoEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobile_number: "",
      present_address_same_as_comm: false,
      permanent_address_same_as_comm: false,
      permanent_address_same_as_present: false,
    },
  });

  const presentSameAsComm = form.watch("present_address_same_as_comm");
  const permanentSameAsComm = form.watch("permanent_address_same_as_comm");
  const permanentSameAsPresent = form.watch("permanent_address_same_as_present");

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_contact_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          mobile_number: data.mobile_number ?? "",
          whatsapp_number: data.whatsapp_number ?? "",
          custodian_name: data.custodian_name ?? "",
          custodian_relation: data.custodian_relation ?? "",
          communication_address: data.communication_address ?? "",
          pin_zip_code: data.pin_zip_code ?? "",
          residential_phone_number: data.residential_phone_number ?? "",
          secondary_mobile_number: data.secondary_mobile_number ?? "",
          preferred_call_time: data.preferred_call_time ?? "",
          alternate_email_id: data.alternate_email_id ?? "",
          reference_name: data.reference_name ?? "",
          reference_relationship: data.reference_relationship ?? "",
          reference_mobile: data.reference_mobile ?? "",
          present_address_same_as_comm:
            data.present_address_same_as_comm ?? false,
          present_address: data.present_address ?? "",
          present_pin_zip_code: data.present_pin_zip_code ?? "",
          permanent_address_same_as_comm:
            data.permanent_address_same_as_comm ?? false,
          permanent_address_same_as_present:
            data.permanent_address_same_as_present ?? false,
          permanent_address: data.permanent_address ?? "",
          permanent_pin_zip_code: data.permanent_pin_zip_code ?? "",
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

    // Clear conditional address fields when "same as" is checked
    if (values.present_address_same_as_comm) {
      payload.present_address = null;
      payload.present_pin_zip_code = null;
    }
    if (
      values.permanent_address_same_as_comm ||
      values.permanent_address_same_as_present
    ) {
      payload.permanent_address = null;
      payload.permanent_pin_zip_code = null;
    }

    const { error } = await supabase
      .from("profile_contact_info")
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

    toast.success("Contact information saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/contact-info");
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
      title="Edit Contact Information"
      breadcrumb="Contact Information"
      cancelHref="/my-home/view-and-edit/contact-info"
      saving={saving}
      onSave={onSave}
    >
      {/* Primary Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Mobile Number <span className="text-destructive">*</span>
          </label>
          <input
            {...form.register("mobile_number")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Mobile number"
          />
          {form.formState.errors.mobile_number && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.mobile_number.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            WhatsApp Number
          </label>
          <input
            {...form.register("whatsapp_number")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="WhatsApp number"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Custodian Name
          </label>
          <input
            {...form.register("custodian_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Custodian name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Custodian Relation
          </label>
          <input
            {...form.register("custodian_relation")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Custodian relation"
          />
        </div>
      </div>

      {/* Communication Address */}
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Communication Address
          </label>
          <textarea
            {...form.register("communication_address")}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
            placeholder="Communication address"
          />
        </div>
        <div className="max-w-xs">
          <label className="text-sm font-medium text-foreground mb-1 block">
            PIN / ZIP Code
          </label>
          <input
            {...form.register("pin_zip_code")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="PIN / ZIP code"
          />
        </div>
      </div>

      {/* Additional Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Residential Phone Number
          </label>
          <input
            {...form.register("residential_phone_number")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Residential phone"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Secondary Mobile Number
          </label>
          <input
            {...form.register("secondary_mobile_number")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Secondary mobile"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Preferred Call Time
          </label>
          <select
            {...form.register("preferred_call_time")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white"
          >
            <option value="">Select Preferred Call Time</option>
            {preferredCallTimeList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Alternate Email ID
          </label>
          <input
            {...form.register("alternate_email_id")}
            type="email"
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Alternate email"
          />
          {form.formState.errors.alternate_email_id && (
            <p className="text-xs text-destructive mt-1">
              {form.formState.errors.alternate_email_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Reference Name
          </label>
          <input
            {...form.register("reference_name")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Reference name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Reference Relationship
          </label>
          <input
            {...form.register("reference_relationship")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Relationship"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Reference Mobile
          </label>
          <input
            {...form.register("reference_mobile")}
            className="w-full h-10 border border-input rounded-lg px-3 text-sm"
            placeholder="Reference mobile"
          />
        </div>
      </div>

      {/* Present Address */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Present Address
        </h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...form.register("present_address_same_as_comm")}
            className="rounded border-input"
          />
          Same as communication address
        </label>
        <ConditionalField condition={!presentSameAsComm}>
          <div className="space-y-4 mt-3 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Present Address
              </label>
              <textarea
                {...form.register("present_address")}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Present address"
              />
            </div>
            <div className="max-w-xs">
              <label className="text-sm font-medium text-foreground mb-1 block">
                PIN / ZIP Code
              </label>
              <input
                {...form.register("present_pin_zip_code")}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm"
                placeholder="PIN / ZIP code"
              />
            </div>
          </div>
        </ConditionalField>
      </div>

      {/* Permanent Address */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Permanent Address
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...form.register("permanent_address_same_as_comm")}
              className="rounded border-input"
            />
            Same as communication address
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...form.register("permanent_address_same_as_present")}
              className="rounded border-input"
            />
            Same as present address
          </label>
        </div>
        <ConditionalField
          condition={!permanentSameAsComm && !permanentSameAsPresent}
        >
          <div className="space-y-4 mt-3 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Permanent Address
              </label>
              <textarea
                {...form.register("permanent_address")}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Permanent address"
              />
            </div>
            <div className="max-w-xs">
              <label className="text-sm font-medium text-foreground mb-1 block">
                PIN / ZIP Code
              </label>
              <input
                {...form.register("permanent_pin_zip_code")}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm"
                placeholder="PIN / ZIP code"
              />
            </div>
          </div>
        </ConditionalField>
      </div>
    </SectionEditForm>
  );
}
