"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  stepFiveSchema,
  type StepFiveFormData,
} from "@/lib/validations/step-five";
import { createClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { SearchableGroupedDropdown } from "@/components/auth/searchable-grouped-dropdown";
import { createdByList, howDidYouHearList } from "@/lib/reference-data";

export function StepFiveForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepFiveFormData>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      creator_contact_country_code: "+91",
    },
  });

  const contactNumber = watch("creator_contact_number") || "";
  const contactCountryCode = watch("creator_contact_country_code") || "+91";

  const onSubmit = async (data: StepFiveFormData) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          created_by: data.created_by,
          creator_name: data.creator_name,
          creator_contact_number: `${data.creator_contact_country_code}${data.creator_contact_number}`,
          how_did_you_hear_about_us: data.how_did_you_hear_about_us,
          onboarding_step_completed: 5,
        })
        .eq("id", profile.id);
      if (error) throw error;

      toast.success("Profile details saved!");
      router.push("/register-free/mob-verification");
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
      {/* Created By */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Created By <span className="text-destructive">*</span>
        </label>
        <select
          {...register("created_by")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.created_by ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {createdByList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.created_by && (
          <p className="mt-1 text-sm text-destructive">
            {errors.created_by.message}
          </p>
        )}
      </div>

      {/* Creator Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Creator Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("creator_name")}
          placeholder="Enter creator name"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.creator_name ? "border-destructive" : "border-input"
          )}
        />
        {errors.creator_name && (
          <p className="mt-1 text-sm text-destructive">
            {errors.creator_name.message}
          </p>
        )}
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Contact Number <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={contactNumber}
          onChange={(val) =>
            setValue("creator_contact_number", val, { shouldValidate: true })
          }
          countryCode={contactCountryCode}
          onCountryCodeChange={(code) =>
            setValue("creator_contact_country_code", code)
          }
          placeholder="Contact number"
          error={errors.creator_contact_number?.message}
        />
      </div>

      {/* How Did You Hear About Us */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          How Did You Hear About Us?{" "}
          <span className="text-destructive">*</span>
        </label>
        <SearchableGroupedDropdown
          groups={howDidYouHearList}
          value={watch("how_did_you_hear_about_us") || ""}
          onChange={(val) =>
            setValue("how_did_you_hear_about_us", val, {
              shouldValidate: true,
            })
          }
          placeholder="Select..."
          error={errors.how_did_you_hear_about_us?.message}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        COMPLETE REGISTRATION
      </button>
    </form>
  );
}
