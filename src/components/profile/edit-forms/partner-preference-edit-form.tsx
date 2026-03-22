"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SectionEditForm } from "@/components/profile/section-edit-form";
import { AccordionSection } from "@/components/onboarding/accordion-section";
import { ConditionalField } from "@/components/onboarding/conditional-field";
import { MultiSelectDropdown } from "@/components/onboarding/multi-select-dropdown";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";
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
  motherTongueList,
  annualIncomeList,
  educationalQualificationsList,
  occupationCategoryList,
  employmentCategoryList,
  countryList,
  indianStateList,
  karnatakaDistrictList,
  residentialStatusList,
} from "@/lib/reference-data";

// Use inline since educationLevelList and educationalQualificationsList are separate
const educationLevelOptions = [
  "High School", "Diploma", "Bachelor's", "Master's", "PhD", "Other",
];

export function PartnerPreferenceEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic
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

  // Religious
  const [prefReligion, setPrefReligion] = useState<string[]>([]);
  const [prefDenomination, setPrefDenomination] = useState<string[]>([]);
  const [prefDiocese, setPrefDiocese] = useState<string[]>([]);
  const [prefCaste, setPrefCaste] = useState<string[]>([]);
  const [prefSubCaste, setPrefSubCaste] = useState<string[]>([]);
  const [prefMuslimSect, setPrefMuslimSect] = useState<string[]>([]);
  const [prefMuslimCommunity, setPrefMuslimCommunity] = useState<string[]>([]);
  const [prefJainSect, setPrefJainSect] = useState<string[]>([]);
  const [prefManglik, setPrefManglik] = useState<string[]>([]);
  const [prefMotherTongue, setPrefMotherTongue] = useState<string[]>([]);

  // Professional
  const [prefEducationLevel, setPrefEducationLevel] = useState<string[]>([]);
  const [prefQualifications, setPrefQualifications] = useState<string[]>([]);
  const [prefOccupation, setPrefOccupation] = useState<string[]>([]);
  const [prefEmployment, setPrefEmployment] = useState<string[]>([]);
  const [prefIncome, setPrefIncome] = useState<string[]>([]);

  // Location
  const [prefWorkingCountry, setPrefWorkingCountry] = useState<string[]>([]);
  const [prefWorkingState, setPrefWorkingState] = useState<string[]>([]);
  const [prefWorkingDistrict, setPrefWorkingDistrict] = useState<string[]>([]);
  const [prefResidingCountry, setPrefResidingCountry] = useState<string[]>([]);
  const [prefResidentialStatus, setPrefResidentialStatus] = useState<string[]>([]);
  const [prefNativeCountry, setPrefNativeCountry] = useState<string[]>([]);
  const [prefNativeState, setPrefNativeState] = useState<string[]>([]);
  const [prefNativeDistrict, setPrefNativeDistrict] = useState<string[]>([]);
  const [prefExpectations, setPrefExpectations] = useState("");

  const flatCountries = countryList.flatMap((g) => g.options);

  const loadData = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("partner_preferences")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    if (data) {
      setPrefMinAge(data.pref_min_age ?? 21);
      setPrefMaxAge(data.pref_max_age ?? 30);
      setPrefMinHeight(data.pref_min_height ?? "");
      setPrefMaxHeight(data.pref_max_height ?? "");
      setPrefMaritalStatus(data.pref_marital_status ?? []);
      setPrefChildrenStatus(data.pref_children_status ?? []);
      setPrefComplexion(data.pref_complexion ?? []);
      setPrefBodyType(data.pref_body_type ?? []);
      setPrefPhysicalStatus(data.pref_physical_status ?? []);
      setPrefDiffAbledCategory(data.pref_category_differently_abled ?? []);
      setPrefFamilyStatus(data.pref_family_status ?? []);
      setPrefReligion(data.pref_religion ?? []);
      setPrefDenomination(data.pref_denomination ?? []);
      setPrefDiocese(data.pref_diocese ?? []);
      setPrefCaste(data.pref_caste ?? []);
      setPrefSubCaste(data.pref_sub_caste ?? []);
      setPrefMuslimSect(data.pref_muslim_sect ?? []);
      setPrefMuslimCommunity(data.pref_muslim_community ?? []);
      setPrefJainSect(data.pref_jain_sect ?? []);
      setPrefManglik(data.pref_manglik ?? []);
      setPrefMotherTongue(data.pref_mother_tongue ?? []);
      setPrefEducationLevel(data.pref_education_level ?? []);
      setPrefQualifications(data.pref_educational_qualifications ?? []);
      setPrefOccupation(data.pref_occupation_category ?? []);
      setPrefEmployment(data.pref_employment_status ?? []);
      setPrefIncome(data.pref_annual_income ?? []);
      setPrefWorkingCountry(data.pref_working_country ?? []);
      setPrefWorkingState(data.pref_working_state ?? []);
      setPrefWorkingDistrict(data.pref_working_district ?? []);
      setPrefResidingCountry(data.pref_residing_country ?? []);
      setPrefResidentialStatus(data.pref_residential_status ?? []);
      setPrefNativeCountry(data.pref_native_country ?? []);
      setPrefNativeState(data.pref_native_state ?? []);
      setPrefNativeDistrict(data.pref_native_district ?? []);
      setPrefExpectations(data.pref_expectations_detail ?? "");
    }
    setLoading(false);
  }, [profile, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Conditional visibility
  const showChildren = prefMaritalStatus.some(
    (s) => s !== "Any" && s !== "Unmarried"
  );
  const showDiffAbled = prefPhysicalStatus.some(
    (s) => s !== "Any" && s === "Differently Abled"
  );
  const showChristian = prefReligion.some(
    (r) => r === "Any" || r === "Christian"
  );
  const showHinduJain = prefReligion.some(
    (r) => r === "Any" || r === "Hindu" || r === "Jain"
  );
  const showMuslim = prefReligion.some(
    (r) => r === "Any" || r === "Muslim"
  );

  async function onSave() {
    if (!profile) return;
    setSaving(true);

    const payload = {
      profile_id: profile.id,
      pref_min_age: prefMinAge,
      pref_max_age: prefMaxAge,
      pref_min_height: prefMinHeight || null,
      pref_max_height: prefMaxHeight || null,
      pref_marital_status: prefMaritalStatus,
      pref_children_status: prefChildrenStatus,
      pref_complexion: prefComplexion,
      pref_body_type: prefBodyType,
      pref_physical_status: prefPhysicalStatus,
      pref_category_differently_abled: showDiffAbled ? prefDiffAbledCategory : [],
      pref_family_status: prefFamilyStatus,
      pref_religion: prefReligion,
      pref_denomination: showChristian ? prefDenomination : [],
      pref_diocese: showChristian ? prefDiocese : [],
      pref_caste: showHinduJain ? prefCaste : [],
      pref_sub_caste: showHinduJain ? prefSubCaste : [],
      pref_muslim_sect: showMuslim ? prefMuslimSect : [],
      pref_muslim_community: showMuslim ? prefMuslimCommunity : [],
      pref_jain_sect: prefReligion.some((r) => r === "Any" || r === "Jain") ? prefJainSect : [],
      pref_manglik: showHinduJain ? prefManglik : [],
      pref_mother_tongue: prefMotherTongue,
      pref_education_level: prefEducationLevel,
      pref_educational_qualifications: prefQualifications,
      pref_occupation_category: prefOccupation,
      pref_employment_status: prefEmployment,
      pref_annual_income: prefIncome,
      pref_working_country: prefWorkingCountry,
      pref_working_state: prefWorkingState,
      pref_working_district: prefWorkingDistrict,
      pref_residing_country: prefResidingCountry,
      pref_residential_status: prefResidentialStatus,
      pref_native_country: prefNativeCountry,
      pref_native_state: prefNativeState,
      pref_native_district: prefNativeDistrict,
      pref_expectations_detail: prefExpectations || null,
    };

    const { error } = await supabase
      .from("partner_preferences")
      .upsert(payload, { onConflict: "profile_id" });

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase.from("profiles").update({ profile_completion_pct: pct }).eq("id", profile.id);

    toast.success("Partner preferences saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/partner-preference");
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
      title="Edit Partner Preferences"
      breadcrumb="Partner Preferences"
      cancelHref="/my-home/view-and-edit/partner-preference"
      saving={saving}
      onSave={onSave}
    >
      {/* Section 1: Basic */}
      <AccordionSection title="Basic Preferences" defaultOpen isComplete={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Min Age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={prefMinAge}
                onChange={(e) => setPrefMinAge(Number(e.target.value))}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Max Age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={prefMaxAge}
                onChange={(e) => setPrefMaxAge(Number(e.target.value))}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Min Height</label>
              <select
                value={prefMinHeight}
                onChange={(e) => setPrefMinHeight(e.target.value)}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white"
              >
                <option value="">Any</option>
                {heightList.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Max Height</label>
              <select
                value={prefMaxHeight}
                onChange={(e) => setPrefMaxHeight(e.target.value)}
                className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white"
              >
                <option value="">Any</option>
                {heightList.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <MultiSelectDropdown label="Marital Status" options={maritalStatusList} value={prefMaritalStatus} onChange={setPrefMaritalStatus} />
          <ConditionalField condition={showChildren}>
            <MultiSelectDropdown label="Children Status" options={childrenStatusList} value={prefChildrenStatus} onChange={setPrefChildrenStatus} />
          </ConditionalField>
          <MultiSelectDropdown label="Complexion" options={complexionList} value={prefComplexion} onChange={setPrefComplexion} />
          <MultiSelectDropdown label="Body Type" options={bodyTypeList} value={prefBodyType} onChange={setPrefBodyType} />
          <MultiSelectDropdown label="Physical Status" options={physicalStatusList} value={prefPhysicalStatus} onChange={setPrefPhysicalStatus} />
          <ConditionalField condition={showDiffAbled}>
            <MultiSelectDropdown label="Differently Abled Category" options={differentlyAbledCategoryList} value={prefDiffAbledCategory} onChange={setPrefDiffAbledCategory} />
          </ConditionalField>
          <MultiSelectDropdown label="Family Status" options={familyStatusList} value={prefFamilyStatus} onChange={setPrefFamilyStatus} />
        </div>
      </AccordionSection>

      {/* Section 2: Religious */}
      <AccordionSection title="Religious Preferences" defaultOpen={false} isComplete={false}>
        <div className="space-y-4">
          <MultiSelectDropdown label="Religion" options={religionList} value={prefReligion} onChange={setPrefReligion} />
          <ConditionalField condition={showChristian}>
            <MultiSelectDropdown label="Denomination" groups={denominationList} value={prefDenomination} onChange={setPrefDenomination} />
            <MultiSelectDropdown label="Diocese" options={dioceseList} value={prefDiocese} onChange={setPrefDiocese} searchable />
          </ConditionalField>
          <ConditionalField condition={showHinduJain}>
            <MultiSelectDropdown label="Caste" options={casteList} value={prefCaste} onChange={setPrefCaste} />
            <MultiSelectDropdown label="Sub-Caste" options={subCasteList} value={prefSubCaste} onChange={setPrefSubCaste} />
            <MultiSelectDropdown label="Manglik" options={manglikList} value={prefManglik} onChange={setPrefManglik} />
          </ConditionalField>
          <ConditionalField condition={showMuslim}>
            <MultiSelectDropdown label="Muslim Sect" options={muslimSectList} value={prefMuslimSect} onChange={setPrefMuslimSect} />
            <MultiSelectDropdown label="Community / Jamath" options={jamathList} value={prefMuslimCommunity} onChange={setPrefMuslimCommunity} />
          </ConditionalField>
          <ConditionalField condition={prefReligion.some((r) => r === "Any" || r === "Jain")}>
            <MultiSelectDropdown label="Jain Sect" options={jainSectList} value={prefJainSect} onChange={setPrefJainSect} />
          </ConditionalField>
          <MultiSelectDropdown label="Mother Tongue" options={motherTongueList} value={prefMotherTongue} onChange={setPrefMotherTongue} />
        </div>
      </AccordionSection>

      {/* Section 3: Professional */}
      <AccordionSection title="Professional Preferences" defaultOpen={false} isComplete={false}>
        <div className="space-y-4">
          <MultiSelectDropdown label="Education Level" options={educationLevelOptions} value={prefEducationLevel} onChange={setPrefEducationLevel} />
          <MultiSelectDropdown label="Qualifications" groups={educationalQualificationsList} value={prefQualifications} onChange={setPrefQualifications} />
          <MultiSelectDropdown label="Occupation" groups={occupationCategoryList} value={prefOccupation} onChange={setPrefOccupation} />
          <MultiSelectDropdown label="Employment" options={employmentCategoryList} value={prefEmployment} onChange={setPrefEmployment} />
          <MultiSelectDropdown label="Annual Income" options={annualIncomeList} value={prefIncome} onChange={setPrefIncome} />
        </div>
      </AccordionSection>

      {/* Section 4: Location */}
      <AccordionSection title="Location Preferences" defaultOpen={false} isComplete={false}>
        <div className="space-y-4">
          <MultiSelectDropdown label="Working Country" options={flatCountries} value={prefWorkingCountry} onChange={setPrefWorkingCountry} searchable />
          <MultiSelectDropdown label="Working State" options={indianStateList} value={prefWorkingState} onChange={setPrefWorkingState} searchable />
          <MultiSelectDropdown label="Working District" options={karnatakaDistrictList} value={prefWorkingDistrict} onChange={setPrefWorkingDistrict} searchable />
          <MultiSelectDropdown label="Residing Country" options={flatCountries} value={prefResidingCountry} onChange={setPrefResidingCountry} searchable />
          <MultiSelectDropdown label="Residential Status" options={residentialStatusList} value={prefResidentialStatus} onChange={setPrefResidentialStatus} />
          <MultiSelectDropdown label="Native Country" options={flatCountries} value={prefNativeCountry} onChange={setPrefNativeCountry} searchable />
          <MultiSelectDropdown label="Native State" options={indianStateList} value={prefNativeState} onChange={setPrefNativeState} searchable />
          <MultiSelectDropdown label="Native District" options={karnatakaDistrictList} value={prefNativeDistrict} onChange={setPrefNativeDistrict} searchable />
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Expectations Detail</label>
            <textarea
              value={prefExpectations}
              onChange={(e) => setPrefExpectations(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[100px]"
              placeholder="Describe your expectations..."
              maxLength={2000}
            />
          </div>
        </div>
      </AccordionSection>
    </SectionEditForm>
  );
}
