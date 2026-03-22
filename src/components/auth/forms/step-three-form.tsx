"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  stepThreeSchema,
  type StepThreeFormData,
} from "@/lib/validations/step-three";
import { createClient } from "@/lib/supabase/client";
import { SearchableGroupedDropdown } from "@/components/auth/searchable-grouped-dropdown";
import {
  educationalQualificationsList,
  educationLevelList,
  occupationCategoryList,
  employmentCategoryList,
  annualIncomeList,
} from "@/lib/reference-data";

export function StepThreeForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepThreeFormData>({
    resolver: zodResolver(stepThreeSchema),
  });

  const workingCountry = watch("working_country");
  const workingState = watch("working_state");
  const isIndia =
    workingCountry?.toLowerCase() === "india" ||
    workingCountry?.toLowerCase() === "in";

  const onSubmit = async (data: StepThreeFormData) => {
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
        .from("profile_education_profession")
        .upsert(
          {
            profile_id: profile.id,
            educational_qualifications: data.educational_qualifications,
            education_level: data.education_level,
            occupation_category: data.occupation_category,
            employment_category: data.employment_category,
            working_country: data.working_country,
            working_state: data.working_state || null,
            working_district: data.working_district || null,
            annual_income: data.annual_income,
          },
          { onConflict: "profile_id" }
        );
      if (error) throw error;

      // Update onboarding step
      await supabase
        .from("profiles")
        .update({ onboarding_step_completed: 3 })
        .eq("id", profile.id);

      toast.success("Education details saved!");
      router.push("/register-free/step-four");
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
      {/* Educational Qualifications */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Educational Qualifications <span className="text-destructive">*</span>
        </label>
        <SearchableGroupedDropdown
          groups={educationalQualificationsList}
          value={watch("educational_qualifications") || ""}
          onChange={(val) =>
            setValue("educational_qualifications", val, {
              shouldValidate: true,
            })
          }
          placeholder="Select qualification..."
          error={errors.educational_qualifications?.message}
        />
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Education Level <span className="text-destructive">*</span>
        </label>
        <select
          {...register("education_level")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.education_level ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {educationLevelList.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {errors.education_level && (
          <p className="mt-1 text-sm text-destructive">
            {errors.education_level.message}
          </p>
        )}
      </div>

      {/* Occupation Category */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Occupation Category <span className="text-destructive">*</span>
        </label>
        <SearchableGroupedDropdown
          groups={occupationCategoryList}
          value={watch("occupation_category") || ""}
          onChange={(val) =>
            setValue("occupation_category", val, { shouldValidate: true })
          }
          placeholder="Select occupation..."
          error={errors.occupation_category?.message}
        />
      </div>

      {/* Employment Category */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Employment Category <span className="text-destructive">*</span>
        </label>
        <select
          {...register("employment_category")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.employment_category
              ? "border-destructive"
              : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {employmentCategoryList.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {errors.employment_category && (
          <p className="mt-1 text-sm text-destructive">
            {errors.employment_category.message}
          </p>
        )}
      </div>

      {/* Working Country */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Working Country <span className="text-destructive">*</span>
        </label>
        <input
          {...register("working_country")}
          placeholder="Enter working country"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.working_country ? "border-destructive" : "border-input"
          )}
        />
        {errors.working_country && (
          <p className="mt-1 text-sm text-destructive">
            {errors.working_country.message}
          </p>
        )}
      </div>

      {/* Working State */}
      {workingCountry && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Working State
          </label>
          <input
            {...register("working_state")}
            placeholder="Enter working state"
            className={cn(
              "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.working_state ? "border-destructive" : "border-input"
            )}
          />
          {errors.working_state && (
            <p className="mt-1 text-sm text-destructive">
              {errors.working_state.message}
            </p>
          )}
        </div>
      )}

      {/* Working District */}
      {isIndia && workingState && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Working District
          </label>
          <input
            {...register("working_district")}
            placeholder="Enter working district"
            className={cn(
              "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.working_district ? "border-destructive" : "border-input"
            )}
          />
          {errors.working_district && (
            <p className="mt-1 text-sm text-destructive">
              {errors.working_district.message}
            </p>
          )}
        </div>
      )}

      {/* Annual Income */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Annual Income <span className="text-destructive">*</span>
        </label>
        <select
          {...register("annual_income")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.annual_income ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {annualIncomeList.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {errors.annual_income && (
          <p className="mt-1 text-sm text-destructive">
            {errors.annual_income.message}
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
