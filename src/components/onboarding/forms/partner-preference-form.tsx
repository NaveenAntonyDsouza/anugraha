"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AccordionSection } from "../accordion-section";
import { ConditionalField } from "../conditional-field";
import { OnboardingLayout } from "../onboarding-layout";
import { MultiSelectDropdown } from "../multi-select-dropdown";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  heightList,
  complexionList,
  bodyTypeList,
  physicalStatusList,
  maritalStatusList,
  familyStatusList,
  religionList,
  denominationList,
  dioceseList,
  casteList,
  subCasteList,
  jamathList,
  muslimSectList,
  jainSectList,
  manglikList,
  childrenStatusList,
  differentlyAbledCategoryList,
  educationLevelList,
  employmentCategoryList,
  annualIncomeList,
  motherTongueList,
  indianStateList,
  countryList,
  residentialStatusList,
} from "@/lib/reference-data";

const ageOptions = Array.from({ length: 53 }, (_, i) => i + 18);

export function PartnerPreferenceForm() {
  const router = useRouter();
  const supabase = createClient();
  const setCompletion = useOnboardingStore((s) => s.setCompletion);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Section completion
  const [basicComplete, setBasicComplete] = useState(false);
  const [religiousComplete, setReligiousComplete] = useState(false);
  const [professionalComplete, setProfessionalComplete] = useState(false);
  const [locationComplete, setLocationComplete] = useState(false);

  // ─── Section 1: Basic Preferences ───
  const [prefMinAge, setPrefMinAge] = useState(21);
  const [prefMaxAge, setPrefMaxAge] = useState(30);
  const [prefMinHeight, setPrefMinHeight] = useState("");
  const [prefMaxHeight, setPrefMaxHeight] = useState("");
  const [prefMaritalStatus, setPrefMaritalStatus] = useState<string[]>([]);
  const [prefChildrenStatus, setPrefChildrenStatus] = useState<string[]>([]);
  const [prefComplexion, setPrefComplexion] = useState<string[]>([]);
  const [prefBodyType, setPrefBodyType] = useState<string[]>([]);
  const [prefPhysicalStatus, setPrefPhysicalStatus] = useState<string[]>([]);
  const [prefDiffAbledCategory, setPrefDiffAbledCategory] = useState<string[]>([]);
  const [prefFamilyStatus, setPrefFamilyStatus] = useState<string[]>([]);

  // ─── Section 2: Religious Preferences ───
  const [prefReligion, setPrefReligion] = useState<string[]>([]);
  const [prefDenomination, setPrefDenomination] = useState<string[]>([]);
  const [prefDiocese, setPrefDiocese] = useState<string[]>([]);
  const [prefCaste, setPrefCaste] = useState<string[]>([]);
  const [prefSubCaste, setPrefSubCaste] = useState<string[]>([]);
  const [prefMuslimSect, setPrefMuslimSect] = useState<string[]>([]);
  const [prefMuslimCommunity, setPrefMuslimCommunity] = useState<string[]>([]);
  const [prefJainSect, setPrefJainSect] = useState<string[]>([]);
  const [prefManglik, setPrefManglik] = useState<string[]>([]);

  // ─── Section 3: Professional Preferences ───
  const [prefEducationLevel, setPrefEducationLevel] = useState<string[]>([]);
  const [prefOccupationCategory, setPrefOccupationCategory] = useState<string[]>([]);
  const [prefEmploymentStatus, setPrefEmploymentStatus] = useState<string[]>([]);
  const [prefAnnualIncome, setPrefAnnualIncome] = useState<string[]>([]);

  // ─── Section 4: Location Preferences ───
  const [prefWorkingCountry, setPrefWorkingCountry] = useState<string[]>([]);
  const [prefWorkingState, setPrefWorkingState] = useState<string[]>([]);
  const [prefWorkingDistrict, setPrefWorkingDistrict] = useState<string[]>([]);
  const [prefResidingCountry, setPrefResidingCountry] = useState<string[]>([]);
  const [prefResidentialStatus, setPrefResidentialStatus] = useState<string[]>([]);
  const [prefNativeCountry, setPrefNativeCountry] = useState<string[]>([]);
  const [prefNativeState, setPrefNativeState] = useState<string[]>([]);
  const [prefNativeDistrict, setPrefNativeDistrict] = useState<string[]>([]);
  const [prefMotherTongue, setPrefMotherTongue] = useState<string[]>([]);
  const [prefExpectationsDetail, setPrefExpectationsDetail] = useState("");

  // Conditional logic helpers
  const showChildrenStatus =
    prefMaritalStatus.length > 0 &&
    !prefMaritalStatus.every((s) => s === "Unmarried" || s === "Any");
  const showDiffAbledCategory =
    prefPhysicalStatus.some((s) => s === "Differently Abled");
  const showChristianFields =
    prefReligion.some((r) => r === "Christian");
  const showHinduJainFields =
    prefReligion.some((r) => r === "Hindu" || r === "Jain");
  const showManglik =
    prefReligion.some((r) => r === "Hindu");
  const showMuslimFields =
    prefReligion.some((r) => r === "Muslim");
  const showJainFields =
    prefReligion.some((r) => r === "Jain");

  // Location cascading — show state if country is not empty and not just "Any"
  const showWorkingState =
    prefWorkingCountry.length > 0 &&
    !prefWorkingCountry.every((c) => c === "Any");
  const showWorkingDistrict =
    showWorkingState && prefWorkingCountry.includes("India") &&
    prefWorkingState.length > 0 &&
    !prefWorkingState.every((s) => s === "Any");
  const showNativeState =
    prefNativeCountry.length > 0 &&
    !prefNativeCountry.every((c) => c === "Any");
  const showNativeDistrict =
    showNativeState && prefNativeCountry.includes("India") &&
    prefNativeState.length > 0 &&
    !prefNativeState.every((s) => s === "Any");

  const allCountryOptions = countryList.flatMap((g) => g.options);

  const refreshCompletion = useCallback(
    async (pid: string) => {
      // Simple: if partner prefs exist, add 10% to profile completion
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completion_pct")
        .eq("id", pid)
        .single();
      if (profile) {
        const current = profile.profile_completion_pct ?? 40;
        const newPct = Math.min(Math.max(current, 50), 100); // at least 50% after prefs
        await supabase
          .from("profiles")
          .update({ profile_completion_pct: newPct })
          .eq("id", pid);
        setCompletion(newPct);
      }
    },
    [supabase, setCompletion]
  );

  // Load existing data
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, profile_completion_pct")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        router.replace("/register-free");
        return;
      }

      setProfileId(profile.id);
      setCompletion(profile.profile_completion_pct ?? 40);

      const { data: prefs } = await supabase
        .from("partner_preferences")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (prefs) {
        // Basic
        if (prefs.pref_min_age) setPrefMinAge(prefs.pref_min_age);
        if (prefs.pref_max_age) setPrefMaxAge(prefs.pref_max_age);
        if (prefs.pref_min_height) setPrefMinHeight(prefs.pref_min_height);
        if (prefs.pref_max_height) setPrefMaxHeight(prefs.pref_max_height);
        if (prefs.pref_marital_status) setPrefMaritalStatus(prefs.pref_marital_status);
        if (prefs.pref_children_status) setPrefChildrenStatus(prefs.pref_children_status);
        if (prefs.pref_complexion) setPrefComplexion(prefs.pref_complexion);
        if (prefs.pref_body_type) setPrefBodyType(prefs.pref_body_type);
        if (prefs.pref_physical_status) setPrefPhysicalStatus(prefs.pref_physical_status);
        if (prefs.pref_category_differently_abled) setPrefDiffAbledCategory(prefs.pref_category_differently_abled);
        if (prefs.pref_family_status) setPrefFamilyStatus(prefs.pref_family_status);
        if (prefs.pref_marital_status?.length) setBasicComplete(true);

        // Religious
        if (prefs.pref_religion) setPrefReligion(prefs.pref_religion);
        if (prefs.pref_denomination) setPrefDenomination(prefs.pref_denomination);
        if (prefs.pref_diocese) setPrefDiocese(prefs.pref_diocese);
        if (prefs.pref_caste) setPrefCaste(prefs.pref_caste);
        if (prefs.pref_sub_caste) setPrefSubCaste(prefs.pref_sub_caste);
        if (prefs.pref_muslim_sect) setPrefMuslimSect(prefs.pref_muslim_sect);
        if (prefs.pref_muslim_community) setPrefMuslimCommunity(prefs.pref_muslim_community);
        if (prefs.pref_jain_sect) setPrefJainSect(prefs.pref_jain_sect);
        if (prefs.pref_manglik) setPrefManglik(prefs.pref_manglik);
        if (prefs.pref_religion?.length) setReligiousComplete(true);

        // Professional
        if (prefs.pref_education_level) setPrefEducationLevel(prefs.pref_education_level);
        if (prefs.pref_occupation_category) setPrefOccupationCategory(prefs.pref_occupation_category);
        if (prefs.pref_employment_status) setPrefEmploymentStatus(prefs.pref_employment_status);
        if (prefs.pref_annual_income) setPrefAnnualIncome(prefs.pref_annual_income);
        if (prefs.pref_education_level?.length) setProfessionalComplete(true);

        // Location
        if (prefs.pref_working_country) setPrefWorkingCountry(prefs.pref_working_country);
        if (prefs.pref_working_state) setPrefWorkingState(prefs.pref_working_state);
        if (prefs.pref_working_district) setPrefWorkingDistrict(prefs.pref_working_district);
        if (prefs.pref_residing_country) setPrefResidingCountry(prefs.pref_residing_country);
        if (prefs.pref_residential_status) setPrefResidentialStatus(prefs.pref_residential_status);
        if (prefs.pref_native_country) setPrefNativeCountry(prefs.pref_native_country);
        if (prefs.pref_native_state) setPrefNativeState(prefs.pref_native_state);
        if (prefs.pref_native_district) setPrefNativeDistrict(prefs.pref_native_district);
        if (prefs.pref_mother_tongue) setPrefMotherTongue(prefs.pref_mother_tongue);
        if (prefs.pref_expectations_detail) setPrefExpectationsDetail(prefs.pref_expectations_detail);
        if (prefs.pref_mother_tongue?.length) setLocationComplete(true);
      }

      setLoading(false);
    }
    load();
  }, [supabase, router, setCompletion]);

  async function saveBasic() {
    if (!profileId) return;
    setSavingSection("basic");
    try {
      const { error } = await supabase.from("partner_preferences").upsert(
        {
          profile_id: profileId,
          pref_min_age: prefMinAge,
          pref_max_age: prefMaxAge,
          pref_min_height: prefMinHeight || null,
          pref_max_height: prefMaxHeight || null,
          pref_marital_status: prefMaritalStatus,
          pref_children_status: showChildrenStatus ? prefChildrenStatus : null,
          pref_complexion: prefComplexion,
          pref_body_type: prefBodyType,
          pref_physical_status: prefPhysicalStatus,
          pref_category_differently_abled: showDiffAbledCategory ? prefDiffAbledCategory : null,
          pref_family_status: prefFamilyStatus,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setBasicComplete(true);
      await refreshCompletion(profileId);
      toast.success("Basic preferences saved");
    } catch {
      toast.error("Failed to save basic preferences");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveReligious() {
    if (!profileId) return;
    setSavingSection("religious");
    try {
      const { error } = await supabase.from("partner_preferences").upsert(
        {
          profile_id: profileId,
          pref_religion: prefReligion,
          pref_denomination: showChristianFields ? prefDenomination : null,
          pref_diocese: showChristianFields ? prefDiocese : null,
          pref_caste: showHinduJainFields ? prefCaste : null,
          pref_sub_caste: showHinduJainFields ? prefSubCaste : null,
          pref_muslim_sect: showMuslimFields ? prefMuslimSect : null,
          pref_muslim_community: showMuslimFields ? prefMuslimCommunity : null,
          pref_jain_sect: showJainFields ? prefJainSect : null,
          pref_manglik: showManglik ? prefManglik : null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setReligiousComplete(true);
      await refreshCompletion(profileId);
      toast.success("Religious preferences saved");
    } catch {
      toast.error("Failed to save religious preferences");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveProfessional() {
    if (!profileId) return;
    setSavingSection("professional");
    try {
      const { error } = await supabase.from("partner_preferences").upsert(
        {
          profile_id: profileId,
          pref_education_level: prefEducationLevel,
          pref_occupation_category: prefOccupationCategory,
          pref_employment_status: prefEmploymentStatus,
          pref_annual_income: prefAnnualIncome,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setProfessionalComplete(true);
      await refreshCompletion(profileId);
      toast.success("Professional preferences saved");
    } catch {
      toast.error("Failed to save professional preferences");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveLocation() {
    if (!profileId) return;
    setSavingSection("location");
    try {
      const { error } = await supabase.from("partner_preferences").upsert(
        {
          profile_id: profileId,
          pref_working_country: prefWorkingCountry,
          pref_working_state: showWorkingState ? prefWorkingState : null,
          pref_working_district: showWorkingDistrict ? prefWorkingDistrict : null,
          pref_residing_country: prefResidingCountry,
          pref_residential_status: prefResidentialStatus,
          pref_native_country: prefNativeCountry,
          pref_native_state: showNativeState ? prefNativeState : null,
          pref_native_district: showNativeDistrict ? prefNativeDistrict : null,
          pref_mother_tongue: prefMotherTongue,
          pref_expectations_detail: prefExpectationsDetail || null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setLocationComplete(true);
      await refreshCompletion(profileId);
      toast.success("Location preferences saved");
    } catch {
      toast.error("Failed to save location preferences");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveAndContinue() {
    setNavigating(true);
    try {
      if (prefMaritalStatus.length > 0) await saveBasic();
      if (prefReligion.length > 0) await saveReligious();
      if (prefEducationLevel.length > 0) await saveProfessional();
      if (prefMotherTongue.length > 0 || prefWorkingCountry.length > 0) {
        await saveLocation();
      }
      router.push("/upload-photos");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setNavigating(false);
    }
  }

  if (loading) {
    return (
      <OnboardingLayout currentStep={3}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={3}>
      <div className="space-y-4">
        {/* ─── Section 1: Basic Preferences ─── */}
        <AccordionSection
          title="Basic Preferences"
          isComplete={basicComplete}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Age Range</label>
              <div className="flex items-center gap-3">
                <select
                  value={prefMinAge}
                  onChange={(e) => setPrefMinAge(Number(e.target.value))}
                  className="flex-1 h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {ageOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground">to</span>
                <select
                  value={prefMaxAge}
                  onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                  className="flex-1 h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {ageOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Height Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Height Range</label>
              <div className="flex items-center gap-3">
                <select
                  value={prefMinHeight}
                  onChange={(e) => setPrefMinHeight(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Min height</option>
                  {heightList.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground">to</span>
                <select
                  value={prefMaxHeight}
                  onChange={(e) => setPrefMaxHeight(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Max height</option>
                  {heightList.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <MultiSelectDropdown
              label="Marital Status"
              options={maritalStatusList}
              value={prefMaritalStatus}
              onChange={setPrefMaritalStatus}
              placeholder="Select marital status"
            />

            <ConditionalField condition={showChildrenStatus}>
              <MultiSelectDropdown
                label="Children Status"
                options={childrenStatusList}
                value={prefChildrenStatus}
                onChange={setPrefChildrenStatus}
                placeholder="Select children status"
              />
            </ConditionalField>

            <div className="grid sm:grid-cols-2 gap-4">
              <MultiSelectDropdown
                label="Complexion"
                options={complexionList}
                value={prefComplexion}
                onChange={setPrefComplexion}
                placeholder="Select complexion"
              />
              <MultiSelectDropdown
                label="Body Type"
                options={bodyTypeList}
                value={prefBodyType}
                onChange={setPrefBodyType}
                placeholder="Select body type"
              />
            </div>

            <MultiSelectDropdown
              label="Physical Status"
              options={physicalStatusList}
              value={prefPhysicalStatus}
              onChange={setPrefPhysicalStatus}
              placeholder="Select physical status"
              includeAny={false}
            />

            <ConditionalField condition={showDiffAbledCategory}>
              <MultiSelectDropdown
                label="Category (Differently Abled)"
                options={differentlyAbledCategoryList}
                value={prefDiffAbledCategory}
                onChange={setPrefDiffAbledCategory}
                placeholder="Select categories"
              />
            </ConditionalField>

            <MultiSelectDropdown
              label="Family Status"
              options={familyStatusList}
              value={prefFamilyStatus}
              onChange={setPrefFamilyStatus}
              placeholder="Select family status"
            />

            <SaveButton
              section="basic"
              saving={savingSection}
              onClick={saveBasic}
            />
          </div>
        </AccordionSection>

        {/* ─── Section 2: Religious Preferences ─── */}
        <AccordionSection
          title="Religious Preferences"
          isComplete={religiousComplete}
        >
          <div className="space-y-4">
            <MultiSelectDropdown
              label="Religion"
              options={religionList}
              value={prefReligion}
              onChange={setPrefReligion}
              placeholder="Select religion"
            />

            <ConditionalField condition={showChristianFields}>
              <div className="space-y-4">
                <MultiSelectDropdown
                  label="Denomination"
                  groups={denominationList}
                  value={prefDenomination}
                  onChange={setPrefDenomination}
                  placeholder="Select denomination"
                />
                <MultiSelectDropdown
                  label="Diocese"
                  options={dioceseList}
                  value={prefDiocese}
                  onChange={setPrefDiocese}
                  placeholder="Select diocese"
                  searchable
                />
              </div>
            </ConditionalField>

            <ConditionalField condition={showHinduJainFields}>
              <div className="space-y-4">
                <MultiSelectDropdown
                  label="Caste"
                  options={casteList}
                  value={prefCaste}
                  onChange={setPrefCaste}
                  placeholder="Select caste"
                  searchable
                />
                <MultiSelectDropdown
                  label="Sub-Caste"
                  options={subCasteList}
                  value={prefSubCaste}
                  onChange={setPrefSubCaste}
                  placeholder="Select sub-caste"
                />
              </div>
            </ConditionalField>

            <ConditionalField condition={showManglik}>
              <MultiSelectDropdown
                label="Manglik"
                options={manglikList}
                value={prefManglik}
                onChange={setPrefManglik}
                placeholder="Select manglik preference"
                includeAny={false}
              />
            </ConditionalField>

            <ConditionalField condition={showMuslimFields}>
              <div className="space-y-4">
                <MultiSelectDropdown
                  label="Muslim Sect"
                  options={muslimSectList}
                  value={prefMuslimSect}
                  onChange={setPrefMuslimSect}
                  placeholder="Select sect"
                />
                <MultiSelectDropdown
                  label="Muslim Community / Jamath"
                  options={jamathList}
                  value={prefMuslimCommunity}
                  onChange={setPrefMuslimCommunity}
                  placeholder="Select community"
                />
              </div>
            </ConditionalField>

            <ConditionalField condition={showJainFields}>
              <MultiSelectDropdown
                label="Jain Sect"
                options={jainSectList}
                value={prefJainSect}
                onChange={setPrefJainSect}
                placeholder="Select Jain sect"
              />
            </ConditionalField>

            <SaveButton
              section="religious"
              saving={savingSection}
              onClick={saveReligious}
            />
          </div>
        </AccordionSection>

        {/* ─── Section 3: Professional Preferences ─── */}
        <AccordionSection
          title="Professional Preferences"
          isComplete={professionalComplete}
        >
          <div className="space-y-4">
            <MultiSelectDropdown
              label="Education Level"
              options={educationLevelList}
              value={prefEducationLevel}
              onChange={setPrefEducationLevel}
              placeholder="Select education level"
            />
            <MultiSelectDropdown
              label="Occupation"
              options={employmentCategoryList}
              value={prefOccupationCategory}
              onChange={setPrefOccupationCategory}
              placeholder="Select occupation"
            />
            <MultiSelectDropdown
              label="Employment Status"
              options={employmentCategoryList}
              value={prefEmploymentStatus}
              onChange={setPrefEmploymentStatus}
              placeholder="Select employment status"
            />
            <MultiSelectDropdown
              label="Annual Income"
              options={annualIncomeList}
              value={prefAnnualIncome}
              onChange={setPrefAnnualIncome}
              placeholder="Select annual income"
            />

            <SaveButton
              section="professional"
              saving={savingSection}
              onClick={saveProfessional}
            />
          </div>
        </AccordionSection>

        {/* ─── Section 4: Location Preferences ─── */}
        <AccordionSection
          title="Location Preferences"
          isComplete={locationComplete}
        >
          <div className="space-y-4">
            {/* Working Location */}
            <p className="text-xs text-muted-foreground font-medium">
              Working Location
            </p>
            <MultiSelectDropdown
              label="Working Country"
              options={allCountryOptions}
              value={prefWorkingCountry}
              onChange={setPrefWorkingCountry}
              placeholder="Select country"
              searchable
            />
            <ConditionalField condition={showWorkingState}>
              <MultiSelectDropdown
                label="Working State"
                options={indianStateList}
                value={prefWorkingState}
                onChange={setPrefWorkingState}
                placeholder="Select state"
                searchable
              />
            </ConditionalField>
            <ConditionalField condition={showWorkingDistrict}>
              <MultiSelectDropdown
                label="Working District"
                options={[]}
                value={prefWorkingDistrict}
                onChange={setPrefWorkingDistrict}
                placeholder="Select district"
                searchable
              />
            </ConditionalField>

            {/* Residing Location */}
            <p className="text-xs text-muted-foreground font-medium mt-2">
              Residing Location
            </p>
            <MultiSelectDropdown
              label="Residing Country"
              options={allCountryOptions}
              value={prefResidingCountry}
              onChange={setPrefResidingCountry}
              placeholder="Select country"
              searchable
            />
            <MultiSelectDropdown
              label="Residential Status"
              options={residentialStatusList}
              value={prefResidentialStatus}
              onChange={setPrefResidentialStatus}
              placeholder="Select status"
            />

            {/* Native Location */}
            <p className="text-xs text-muted-foreground font-medium mt-2">
              Native Location
            </p>
            <MultiSelectDropdown
              label="Native Country"
              options={allCountryOptions}
              value={prefNativeCountry}
              onChange={setPrefNativeCountry}
              placeholder="Select country"
              searchable
            />
            <ConditionalField condition={showNativeState}>
              <MultiSelectDropdown
                label="Native State"
                options={indianStateList}
                value={prefNativeState}
                onChange={setPrefNativeState}
                placeholder="Select state"
                searchable
              />
            </ConditionalField>
            <ConditionalField condition={showNativeDistrict}>
              <MultiSelectDropdown
                label="Native District"
                options={[]}
                value={prefNativeDistrict}
                onChange={setPrefNativeDistrict}
                placeholder="Select district"
                searchable
              />
            </ConditionalField>

            {/* Mother Tongue */}
            <MultiSelectDropdown
              label="Mother Tongue"
              options={motherTongueList}
              value={prefMotherTongue}
              onChange={setPrefMotherTongue}
              placeholder="Select mother tongue"
            />

            {/* Expectations */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Expectations Detail
              </label>
              <textarea
                value={prefExpectationsDetail}
                onChange={(e) => setPrefExpectationsDetail(e.target.value)}
                placeholder="Describe your expectations from your partner..."
                maxLength={2000}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {prefExpectationsDetail.length}/2000 characters
              </p>
            </div>

            <SaveButton
              section="location"
              saving={savingSection}
              onClick={saveLocation}
            />
          </div>
        </AccordionSection>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => router.push("/upload-photos")}
          className="h-11 px-6 border border-input text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={navigating}
          className="h-11 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {navigating && <Loader2 className="h-4 w-4 animate-spin" />}
          Save &amp; Continue
        </button>
      </div>
    </OnboardingLayout>
  );
}

/* ─── Save Button ─── */

function SaveButton({
  section,
  saving,
  onClick,
}: {
  section: string;
  saving: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving === section}
      className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {saving === section && <Loader2 className="h-4 w-4 animate-spin" />}
      Save
    </button>
  );
}
