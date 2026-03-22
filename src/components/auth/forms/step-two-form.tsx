"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { stepTwoSchema, type StepTwoFormData } from "@/lib/validations/step-two";
import { createClient } from "@/lib/supabase/client";
import { SearchableGroupedDropdown } from "@/components/auth/searchable-grouped-dropdown";
import {
  heightList,
  complexionList,
  bodyTypeList,
  physicalStatusList,
  maritalStatusList,
  familyStatusList,
  religionList,
  denominationList,
  casteList,
  subCasteList,
  raasiList,
  nakshatraList,
  gothramList,
  jamathList,
} from "@/lib/reference-data";

const DIFFERENTLY_ABLED_CATEGORIES = [
  "Visual Impairment",
  "Hearing Impairment",
  "Speech Impairment",
  "Locomotor Disability",
  "Intellectual Disability",
  "Multiple Disabilities",
  "Other",
];

export function StepTwoForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepTwoFormData>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      category_differently_abled: [],
    },
  });

  const physicalStatus = watch("physical_status");
  const maritalStatus = watch("marital_status");
  const religion = watch("religion");
  const selectedCategories = watch("category_differently_abled") || [];

  const isDifferentlyAbled = physicalStatus === "Differently Abled";
  const isNotUnmarried = maritalStatus && maritalStatus !== "Unmarried";
  const isChristian = religion === "Christian";
  const isHindu = religion === "Hindu";
  const isMuslim = religion === "Muslim";
  const isJain = religion === "Jain";
  const isHinduOrJain = isHindu || isJain;
  const isOtherReligion = religion === "Other";

  const handleCategoryToggle = (category: string) => {
    const current = selectedCategories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setValue("category_differently_abled", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: StepTwoFormData) => {
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

      // Upsert primary info
      const { error: primaryError } = await supabase
        .from("profile_primary_info")
        .upsert(
          {
            profile_id: profile.id,
            height: data.height,
            complexion: data.complexion,
            body_type: data.body_type,
            physical_status: data.physical_status,
            category_differently_abled: isDifferentlyAbled
              ? data.category_differently_abled
              : null,
            describe_differently_abled: isDifferentlyAbled
              ? data.differently_abled_describe
              : null,
            specify_differently_abled: isDifferentlyAbled
              ? data.differently_abled_specify
              : null,
            marital_status: data.marital_status,
            children_with_me: isNotUnmarried ? data.children_with_me : null,
            children_not_with_me: isNotUnmarried
              ? data.children_not_with_me
              : null,
            family_status: data.family_status,
          },
          { onConflict: "profile_id" }
        );
      if (primaryError) throw primaryError;

      // Build religious info payload based on religion
      const religiousPayload: Record<string, unknown> = {
        profile_id: profile.id,
        religion: data.religion,
      };

      // Helper: convert empty strings to null for optional DB fields
      const orNull = (v: string | undefined | null) => (v && v.trim() !== "" ? v : null);

      if (isChristian) {
        religiousPayload.denomination = orNull(data.denomination);
        religiousPayload.diocese = orNull(data.diocese);
        religiousPayload.diocese_name = orNull(data.diocese_name);
        religiousPayload.parish_name_place = orNull(data.parish_name_place);
      } else if (isHinduOrJain) {
        religiousPayload.caste_community = orNull(data.caste_community);
        religiousPayload.sub_caste_community = orNull(data.sub_caste_community);
        religiousPayload.time_of_birth = orNull(data.time_of_birth);
        religiousPayload.place_of_birth = orNull(data.place_of_birth);
        religiousPayload.rasi = orNull(data.rasi);
        religiousPayload.nakshatra = orNull(data.nakshatra);
        religiousPayload.gothram = orNull(data.gothram);
        religiousPayload.manglik = orNull(data.manglik);
        if (isJain) {
          religiousPayload.jain_sect = orNull(data.jain_sect);
        }
      } else if (isMuslim) {
        religiousPayload.muslim_sect = orNull(data.muslim_sect);
        religiousPayload.muslim_community = orNull(data.muslim_community);
        religiousPayload.religious_observance = orNull(data.religious_observance);
      } else if (isOtherReligion) {
        religiousPayload.other_religion_name = orNull(data.other_religion_name);
      }

      const { error: religiousError } = await supabase
        .from("profile_religious_info")
        .upsert(religiousPayload, { onConflict: "profile_id" });
      if (religiousError) throw religiousError;

      // Update onboarding step
      await supabase
        .from("profiles")
        .update({ onboarding_step_completed: 2 })
        .eq("id", profile.id);

      toast.success("Personal details saved!");
      router.push("/register-free/step-three");
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
      {/* Height */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Height <span className="text-destructive">*</span>
        </label>
        <select
          {...register("height")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.height ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {heightList.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {errors.height && (
          <p className="mt-1 text-sm text-destructive">
            {errors.height.message}
          </p>
        )}
      </div>

      {/* Complexion */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Complexion <span className="text-destructive">*</span>
        </label>
        <select
          {...register("complexion")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.complexion ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {complexionList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.complexion && (
          <p className="mt-1 text-sm text-destructive">
            {errors.complexion.message}
          </p>
        )}
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Body Type <span className="text-destructive">*</span>
        </label>
        <select
          {...register("body_type")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.body_type ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {bodyTypeList.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        {errors.body_type && (
          <p className="mt-1 text-sm text-destructive">
            {errors.body_type.message}
          </p>
        )}
      </div>

      {/* Physical Status */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Physical Status <span className="text-destructive">*</span>
        </label>
        <select
          {...register("physical_status")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.physical_status ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {physicalStatusList.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.physical_status && (
          <p className="mt-1 text-sm text-destructive">
            {errors.physical_status.message}
          </p>
        )}
      </div>

      {/* Differently Abled Details */}
      {isDifferentlyAbled && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category
            </label>
            <div className="space-y-2">
              {DIFFERENTLY_ABLED_CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Describe
            </label>
            <textarea
              {...register("differently_abled_describe")}
              placeholder="Please describe your condition"
              rows={3}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none",
                errors.differently_abled_describe
                  ? "border-destructive"
                  : "border-input"
              )}
            />
            {errors.differently_abled_describe && (
              <p className="mt-1 text-sm text-destructive">
                {errors.differently_abled_describe.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Marital Status */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Marital Status <span className="text-destructive">*</span>
        </label>
        <select
          {...register("marital_status")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.marital_status ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {maritalStatusList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {errors.marital_status && (
          <p className="mt-1 text-sm text-destructive">
            {errors.marital_status.message}
          </p>
        )}
      </div>

      {/* Children fields (shown when not unmarried) */}
      {isNotUnmarried && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Children with me
            </label>
            <input
              type="number"
              min={0}
              {...register("children_with_me", { valueAsNumber: true })}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.children_with_me
                  ? "border-destructive"
                  : "border-input"
              )}
            />
            {errors.children_with_me && (
              <p className="mt-1 text-sm text-destructive">
                {errors.children_with_me.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Children not with me
            </label>
            <input
              type="number"
              min={0}
              {...register("children_not_with_me", { valueAsNumber: true })}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.children_not_with_me
                  ? "border-destructive"
                  : "border-input"
              )}
            />
            {errors.children_not_with_me && (
              <p className="mt-1 text-sm text-destructive">
                {errors.children_not_with_me.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Family Status */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Family Status <span className="text-destructive">*</span>
        </label>
        <select
          {...register("family_status")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.family_status ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {familyStatusList.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {errors.family_status && (
          <p className="mt-1 text-sm text-destructive">
            {errors.family_status.message}
          </p>
        )}
      </div>

      {/* Religion */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Religion <span className="text-destructive">*</span>
        </label>
        <select
          {...register("religion")}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.religion ? "border-destructive" : "border-input"
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {religionList.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.religion && (
          <p className="mt-1 text-sm text-destructive">
            {errors.religion.message}
          </p>
        )}
      </div>

      {/* ===== CHRISTIAN FIELDS ===== */}
      {isChristian && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Denomination
            </label>
            <SearchableGroupedDropdown
              groups={denominationList}
              value={watch("denomination") || ""}
              onChange={(val) =>
                setValue("denomination", val, { shouldValidate: true })
              }
              placeholder="Select denomination..."
            />
            {errors.denomination && (
              <p className="mt-1 text-sm text-destructive">
                {errors.denomination.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Diocese</label>
            <input
              {...register("diocese")}
              placeholder="Enter diocese"
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.diocese ? "border-destructive" : "border-input"
              )}
            />
            {errors.diocese && (
              <p className="mt-1 text-sm text-destructive">
                {errors.diocese.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Parish Name
            </label>
            <input
              {...register("parish_name_place")}
              placeholder="Enter parish name"
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.parish_name_place
                  ? "border-destructive"
                  : "border-input"
              )}
            />
            {errors.parish_name_place && (
              <p className="mt-1 text-sm text-destructive">
                {errors.parish_name_place.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* ===== HINDU / JAIN FIELDS ===== */}
      {isHinduOrJain && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">Caste</label>
            <select
              {...register("caste_community")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.caste_community
                  ? "border-destructive"
                  : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {casteList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.caste_community && (
              <p className="mt-1 text-sm text-destructive">
                {errors.caste_community.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Sub-Caste
            </label>
            <select
              {...register("sub_caste_community")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.sub_caste_community
                  ? "border-destructive"
                  : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {subCasteList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.sub_caste_community && (
              <p className="mt-1 text-sm text-destructive">
                {errors.sub_caste_community.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Time of Birth
            </label>
            <input
              type="time"
              {...register("time_of_birth")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.time_of_birth ? "border-destructive" : "border-input"
              )}
            />
            {errors.time_of_birth && (
              <p className="mt-1 text-sm text-destructive">
                {errors.time_of_birth.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Place of Birth
            </label>
            <input
              {...register("place_of_birth")}
              placeholder="Enter place of birth"
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.place_of_birth ? "border-destructive" : "border-input"
              )}
            />
            {errors.place_of_birth && (
              <p className="mt-1 text-sm text-destructive">
                {errors.place_of_birth.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Rasi</label>
            <select
              {...register("rasi")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.rasi ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {raasiList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.rasi && (
              <p className="mt-1 text-sm text-destructive">
                {errors.rasi.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nakshatra
            </label>
            <select
              {...register("nakshatra")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.nakshatra ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {nakshatraList.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {errors.nakshatra && (
              <p className="mt-1 text-sm text-destructive">
                {errors.nakshatra.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Gothram</label>
            <select
              {...register("gothram")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.gothram ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {gothramList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gothram && (
              <p className="mt-1 text-sm text-destructive">
                {errors.gothram.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Manglik</label>
            <select
              {...register("manglik")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.manglik ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Don't Know">Don&apos;t Know</option>
            </select>
            {errors.manglik && (
              <p className="mt-1 text-sm text-destructive">
                {errors.manglik.message}
              </p>
            )}
          </div>

          {/* Jain-specific: Jain Sect */}
          {isJain && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Jain Sect
              </label>
              <select
                {...register("jain_sect")}
                className={cn(
                  "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                  errors.jain_sect ? "border-destructive" : "border-input"
                )}
              >
                <option value="" disabled>
                  Select...
                </option>
                <option value="Digambar">Digambar</option>
                <option value="Shvetambar">Shvetambar</option>
                <option value="Other">Other</option>
              </select>
              {errors.jain_sect && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.jain_sect.message}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== MUSLIM FIELDS ===== */}
      {isMuslim && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sect</label>
            <select
              {...register("muslim_sect")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.muslim_sect ? "border-destructive" : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="Sunni">Sunni</option>
              <option value="Shia">Shia</option>
              <option value="Other">Other</option>
            </select>
            {errors.muslim_sect && (
              <p className="mt-1 text-sm text-destructive">
                {errors.muslim_sect.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Community / Jamath
            </label>
            <select
              {...register("muslim_community")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.muslim_community
                  ? "border-destructive"
                  : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              {jamathList.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            {errors.muslim_community && (
              <p className="mt-1 text-sm text-destructive">
                {errors.muslim_community.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Religious Observance
            </label>
            <select
              {...register("religious_observance")}
              className={cn(
                "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                errors.religious_observance
                  ? "border-destructive"
                  : "border-input"
              )}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="Very Religious">Very Religious</option>
              <option value="Religious">Religious</option>
              <option value="Moderate">Moderate</option>
              <option value="Liberal">Liberal</option>
            </select>
            {errors.religious_observance && (
              <p className="mt-1 text-sm text-destructive">
                {errors.religious_observance.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* ===== OTHER RELIGION ===== */}
      {isOtherReligion && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Other Religion Name
          </label>
          <input
            {...register("other_religion_name")}
            placeholder="Enter your religion"
            className={cn(
              "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.other_religion_name
                ? "border-destructive"
                : "border-input"
            )}
          />
          {errors.other_religion_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.other_religion_name.message}
            </p>
          )}
        </div>
      )}

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
