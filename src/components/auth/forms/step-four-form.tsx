"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  stepFourSchema,
  type StepFourFormData,
} from "@/lib/validations/step-four";
import { createClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";

export function StepFourForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepFourFormData>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      whatsapp_country_code: "+91",
      mobile_country_code: "+91",
    },
  });

  const nativeCountry = watch("native_country");
  const nativeState = watch("native_state");
  const isIndia =
    nativeCountry?.toLowerCase() === "india" ||
    nativeCountry?.toLowerCase() === "in";
  const whatsappNumber = watch("whatsapp_number") || "";
  const whatsappCountryCode = watch("whatsapp_country_code") || "+91";
  const mobileNumber = watch("mobile_number") || "";
  const mobileCountryCode = watch("mobile_country_code") || "+91";
  const communicationAddress = watch("communication_address") || "";

  // Pre-fill mobile number from profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, primary_mobile_number")
          .eq("user_id", user.id)
          .single();

        if (profile?.primary_mobile_number) {
          // Extract country code and number
          const fullNumber = profile.primary_mobile_number;
          // Try to find a matching country code prefix
          const codes = ["+971", "+966", "+974", "+968", "+973", "+965", "+91", "+44", "+61", "+65", "+49", "+1"];
          let foundCode = "+91";
          let numberPart = fullNumber;
          for (const code of codes) {
            if (fullNumber.startsWith(code)) {
              foundCode = code;
              numberPart = fullNumber.slice(code.length);
              break;
            }
          }
          setValue("mobile_country_code", foundCode);
          setValue("mobile_number", numberPart);
        }
      } catch {
        // Silently fail - mobile number pre-fill is optional
      }
    }
    loadProfile();
  }, [supabase, setValue]);

  const onSubmit = async (data: StepFourFormData) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, primary_mobile_number")
        .eq("user_id", user.id)
        .single();
      if (!profileData) throw new Error("Profile not found");
      const profile = profileData;

      // Upsert location info
      const { error: locationError } = await supabase
        .from("profile_location_info")
        .upsert(
          {
            profile_id: profile.id,
            native_country: data.native_country,
            native_state: data.native_state || null,
            native_district: data.native_district || null,
          },
          { onConflict: "profile_id" }
        );
      if (locationError) throw locationError;

      // Upsert contact info
      const mobileFull = data.mobile_number
        ? `${data.mobile_country_code}${data.mobile_number}`
        : profileData?.primary_mobile_number ?? "";
      const { error: contactError } = await supabase
        .from("profile_contact_info")
        .upsert(
          {
            profile_id: profile.id,
            mobile_number: mobileFull,
            whatsapp_number: data.whatsapp_number
              ? `${data.whatsapp_country_code}${data.whatsapp_number}`
              : null,
            custodian_name: data.custodian_name || null,
            custodian_relation: data.custodian_relation || null,
            communication_address: data.communication_address || null,
            pin_zip_code: data.pin_zip_code || null,
          },
          { onConflict: "profile_id" }
        );
      if (contactError) throw contactError;

      // Update onboarding step
      await supabase
        .from("profiles")
        .update({ onboarding_step_completed: 4 })
        .eq("id", profile.id);

      toast.success("Location & contact details saved!");
      router.push("/register-free/final-step");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save details";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Native Country */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Native Country <span className="text-destructive">*</span>
        </label>
        <input
          {...register("native_country")}
          placeholder="Enter native country"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.native_country ? "border-destructive" : "border-input"
          )}
        />
        {errors.native_country && (
          <p className="mt-1 text-sm text-destructive">
            {errors.native_country.message}
          </p>
        )}
      </div>

      {/* Native State */}
      {nativeCountry && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Native State
          </label>
          <input
            {...register("native_state")}
            placeholder="Enter native state"
            className={cn(
              "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.native_state ? "border-destructive" : "border-input"
            )}
          />
          {errors.native_state && (
            <p className="mt-1 text-sm text-destructive">
              {errors.native_state.message}
            </p>
          )}
        </div>
      )}

      {/* Native District */}
      {isIndia && nativeState && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Native District
          </label>
          <input
            {...register("native_district")}
            placeholder="Enter native district"
            className={cn(
              "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.native_district ? "border-destructive" : "border-input"
            )}
          />
          {errors.native_district && (
            <p className="mt-1 text-sm text-destructive">
              {errors.native_district.message}
            </p>
          )}
        </div>
      )}

      {/* WhatsApp Number (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          WhatsApp Number
        </label>
        <PhoneInput
          value={whatsappNumber}
          onChange={(val) =>
            setValue("whatsapp_number", val, { shouldValidate: true })
          }
          countryCode={whatsappCountryCode}
          onCountryCodeChange={(code) =>
            setValue("whatsapp_country_code", code)
          }
          placeholder="WhatsApp number (optional)"
          error={errors.whatsapp_number?.message}
        />
      </div>

      {/* Mobile Number (read-only, pre-filled) */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mobile Number
        </label>
        <PhoneInput
          value={mobileNumber}
          onChange={() => {}}
          countryCode={mobileCountryCode}
          onCountryCodeChange={() => {}}
          placeholder="Mobile number"
          readOnly
          error={errors.mobile_number?.message}
        />
      </div>

      {/* Custodian Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Custodian Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("custodian_name")}
          placeholder="Enter custodian name"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.custodian_name ? "border-destructive" : "border-input"
          )}
        />
        {errors.custodian_name && (
          <p className="mt-1 text-sm text-destructive">
            {errors.custodian_name.message}
          </p>
        )}
      </div>

      {/* Custodian Relation */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Custodian Relation <span className="text-destructive">*</span>
        </label>
        <input
          {...register("custodian_relation")}
          placeholder="e.g., Father, Mother, Guardian"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.custodian_relation ? "border-destructive" : "border-input"
          )}
        />
        {errors.custodian_relation && (
          <p className="mt-1 text-sm text-destructive">
            {errors.custodian_relation.message}
          </p>
        )}
      </div>

      {/* Communication Address */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Communication Address <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("communication_address")}
          placeholder="Enter communication address"
          rows={3}
          maxLength={200}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none",
            errors.communication_address
              ? "border-destructive"
              : "border-input"
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {communicationAddress.length}/200 characters
        </p>
        {errors.communication_address && (
          <p className="mt-1 text-sm text-destructive">
            {errors.communication_address.message}
          </p>
        )}
      </div>

      {/* PIN/ZIP Code */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          PIN/ZIP Code <span className="text-destructive">*</span>
        </label>
        <input
          {...register("pin_zip_code")}
          placeholder="Enter PIN/ZIP code"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.pin_zip_code ? "border-destructive" : "border-input"
          )}
        />
        {errors.pin_zip_code && (
          <p className="mt-1 text-sm text-destructive">
            {errors.pin_zip_code.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        SAVE & CONTINUE
      </button>
    </form>
  );
}
