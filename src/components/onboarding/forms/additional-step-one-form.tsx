"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AccordionSection } from "../accordion-section";
import { OnboardingLayout } from "../onboarding-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import {
  weightList,
  bloodGroupList,
  motherTongueList,
} from "@/lib/reference-data";

export function AdditionalStepOneForm() {
  const router = useRouter();
  const supabase = createClient();
  const setCompletion = useOnboardingStore((s) => s.setCompletion);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Section completion states
  const [personalComplete, setPersonalComplete] = useState(false);
  const [professionalComplete, setProfessionalComplete] = useState(false);
  const [familyComplete, setFamilyComplete] = useState(false);
  const [siblingComplete, setSiblingComplete] = useState(false);

  // Section 1: Personal Details
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [aboutCandidate, setAboutCandidate] = useState("");

  // Section 2: Professional Details
  const [educationInDetail, setEducationInDetail] = useState("");
  const [occupationInDetail, setOccupationInDetail] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  // Section 3: Family Details
  const [fatherName, setFatherName] = useState("");
  const [fatherHouseName, setFatherHouseName] = useState("");
  const [fatherNativePlace, setFatherNativePlace] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherHouseName, setMotherHouseName] = useState("");
  const [motherNativePlace, setMotherNativePlace] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [assetDetails, setAssetDetails] = useState("");
  const [aboutFamily, setAboutFamily] = useState("");

  // Section 4: Sibling Details
  const [brothersMarried, setBrothersMarried] = useState(0);
  const [brothersUnmarried, setBrothersUnmarried] = useState(0);
  const [brothersPriest, setBrothersPriest] = useState(0);
  const [sistersMarried, setSistersMarried] = useState(0);
  const [sistersUnmarried, setSistersUnmarried] = useState(0);
  const [sistersNun, setSistersNun] = useState(0);

  const refreshCompletion = useCallback(
    async (pid: string) => {
      const pct = await calculateProfileCompletion(pid);
      setCompletion(pct);
    },
    [setCompletion]
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

      // Load profile_primary_info optional fields
      const { data: primaryInfo } = await supabase
        .from("profile_primary_info")
        .select("weight, blood_group, mother_tongue, about_the_candidate")
        .eq("profile_id", profile.id)
        .single();

      if (primaryInfo) {
        if (primaryInfo.weight) setWeight(primaryInfo.weight);
        if (primaryInfo.blood_group) setBloodGroup(primaryInfo.blood_group);
        if (primaryInfo.mother_tongue) setMotherTongue(primaryInfo.mother_tongue);
        if (primaryInfo.about_the_candidate) setAboutCandidate(primaryInfo.about_the_candidate);
        if (primaryInfo.weight || primaryInfo.blood_group || primaryInfo.mother_tongue) {
          setPersonalComplete(true);
        }
      }

      // Load profile_education_profession optional fields
      const { data: eduInfo } = await supabase
        .from("profile_education_profession")
        .select("education_in_detail, occupation_in_detail, organization_name")
        .eq("profile_id", profile.id)
        .single();

      if (eduInfo) {
        if (eduInfo.education_in_detail) setEducationInDetail(eduInfo.education_in_detail);
        if (eduInfo.occupation_in_detail) setOccupationInDetail(eduInfo.occupation_in_detail);
        if (eduInfo.organization_name) setOrganizationName(eduInfo.organization_name);
        if (eduInfo.education_in_detail || eduInfo.occupation_in_detail) {
          setProfessionalComplete(true);
        }
      }

      // Load family info
      const { data: familyInfo } = await supabase
        .from("profile_family_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (familyInfo) {
        if (familyInfo.father_name) setFatherName(familyInfo.father_name);
        if (familyInfo.father_house_name) setFatherHouseName(familyInfo.father_house_name);
        if (familyInfo.father_native_place) setFatherNativePlace(familyInfo.father_native_place);
        if (familyInfo.father_occupation) setFatherOccupation(familyInfo.father_occupation);
        if (familyInfo.mother_name) setMotherName(familyInfo.mother_name);
        if (familyInfo.mother_house_name) setMotherHouseName(familyInfo.mother_house_name);
        if (familyInfo.mother_native_place) setMotherNativePlace(familyInfo.mother_native_place);
        if (familyInfo.mother_occupation) setMotherOccupation(familyInfo.mother_occupation);
        if (familyInfo.candidate_asset_details) setAssetDetails(familyInfo.candidate_asset_details);
        if (familyInfo.about_candidate_family) setAboutFamily(familyInfo.about_candidate_family);
        if (familyInfo.father_name || familyInfo.mother_name) {
          setFamilyComplete(true);
        }
      }

      // Load sibling info
      const { data: siblingInfo } = await supabase
        .from("profile_sibling_info")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (siblingInfo) {
        setBrothersMarried(siblingInfo.brothers_married ?? 0);
        setBrothersUnmarried(siblingInfo.brothers_unmarried ?? 0);
        setBrothersPriest(siblingInfo.brothers_priest ?? 0);
        setSistersMarried(siblingInfo.sisters_married ?? 0);
        setSistersUnmarried(siblingInfo.sisters_unmarried ?? 0);
        setSistersNun(siblingInfo.sisters_nun ?? 0);
        const hasSiblings =
          (siblingInfo.brothers_married ?? 0) > 0 ||
          (siblingInfo.brothers_unmarried ?? 0) > 0 ||
          (siblingInfo.sisters_married ?? 0) > 0 ||
          (siblingInfo.sisters_unmarried ?? 0) > 0;
        if (hasSiblings) setSiblingComplete(true);
      }

      setLoading(false);
    }
    load();
  }, [supabase, router, setCompletion]);

  async function savePersonal() {
    if (!profileId) return;
    setSavingSection("personal");
    try {
      const { error } = await supabase.from("profile_primary_info").upsert(
        {
          profile_id: profileId,
          weight,
          blood_group: bloodGroup,
          mother_tongue: motherTongue,
          about_the_candidate: aboutCandidate,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setPersonalComplete(true);
      await refreshCompletion(profileId);
      toast.success("Personal details saved");
    } catch {
      toast.error("Failed to save personal details");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveProfessional() {
    if (!profileId) return;
    setSavingSection("professional");
    try {
      const { error } = await supabase.from("profile_education_profession").upsert(
        {
          profile_id: profileId,
          education_in_detail: educationInDetail,
          occupation_in_detail: occupationInDetail,
          organization_name: organizationName,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setProfessionalComplete(true);
      await refreshCompletion(profileId);
      toast.success("Professional details saved");
    } catch {
      toast.error("Failed to save professional details");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveFamily() {
    if (!profileId) return;
    setSavingSection("family");
    try {
      const { error } = await supabase.from("profile_family_info").upsert(
        {
          profile_id: profileId,
          father_name: fatherName,
          father_house_name: fatherHouseName,
          father_native_place: fatherNativePlace,
          father_occupation: fatherOccupation,
          mother_name: motherName,
          mother_house_name: motherHouseName,
          mother_native_place: motherNativePlace,
          mother_occupation: motherOccupation,
          candidate_asset_details: assetDetails,
          about_candidate_family: aboutFamily,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setFamilyComplete(true);
      await refreshCompletion(profileId);
      toast.success("Family details saved");
    } catch {
      toast.error("Failed to save family details");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveSibling() {
    if (!profileId) return;
    setSavingSection("sibling");
    try {
      const { error } = await supabase.from("profile_sibling_info").upsert(
        {
          profile_id: profileId,
          brothers_married: brothersMarried,
          brothers_unmarried: brothersUnmarried,
          brothers_priest: brothersPriest,
          sisters_married: sistersMarried,
          sisters_unmarried: sistersUnmarried,
          sisters_nun: sistersNun,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setSiblingComplete(true);
      await refreshCompletion(profileId);
      toast.success("Sibling details saved");
    } catch {
      toast.error("Failed to save sibling details");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveAndContinue() {
    setNavigating(true);
    try {
      // Save all sections that have data
      if (weight || bloodGroup || motherTongue || aboutCandidate) {
        await savePersonal();
      }
      if (educationInDetail || occupationInDetail || organizationName) {
        await saveProfessional();
      }
      if (fatherName || motherName || assetDetails || aboutFamily) {
        await saveFamily();
      }
      const hasSiblingData =
        brothersMarried > 0 || brothersUnmarried > 0 || brothersPriest > 0 ||
        sistersMarried > 0 || sistersUnmarried > 0 || sistersNun > 0;
      if (hasSiblingData) {
        await saveSibling();
      }
      router.push("/register-free/additional-step-two");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setNavigating(false);
    }
  }

  if (loading) {
    return (
      <OnboardingLayout currentStep={1}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={1}>
      <div className="space-y-4">
        {/* Section 1: Personal Details */}
        <AccordionSection
          title="Personal Details"
          isComplete={personalComplete}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Weight</label>
                <select
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select weight</option>
                  {weightList.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select blood group</option>
                  {bloodGroupList.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mother Tongue</label>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select mother tongue</option>
                {motherTongueList.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                About the Candidate
              </label>
              <textarea
                value={aboutCandidate}
                onChange={(e) => setAboutCandidate(e.target.value)}
                placeholder="Write a brief description about yourself..."
                maxLength={5000}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {aboutCandidate.length}/5000 characters
              </p>
            </div>

            <button
              type="button"
              onClick={savePersonal}
              disabled={savingSection === "personal"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "personal" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 2: Professional Details */}
        <AccordionSection
          title="Professional Details"
          isComplete={professionalComplete}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Education in Detail
              </label>
              <textarea
                value={educationInDetail}
                onChange={(e) => setEducationInDetail(e.target.value)}
                placeholder="Describe your educational background..."
                maxLength={200}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {educationInDetail.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Occupation in Detail
              </label>
              <textarea
                value={occupationInDetail}
                onChange={(e) => setOccupationInDetail(e.target.value)}
                placeholder="Describe your current occupation..."
                maxLength={200}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {occupationInDetail.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter your organization name"
                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={saveProfessional}
              disabled={savingSection === "professional"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "professional" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 3: Family Details */}
        <AccordionSection title="Family Details" isComplete={familyComplete}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground -mt-1">
              Father&apos;s Information
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Father&apos;s Name
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter father's name"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Father&apos;s House Name
                </label>
                <input
                  type="text"
                  value={fatherHouseName}
                  onChange={(e) => setFatherHouseName(e.target.value)}
                  placeholder="Enter father's house name"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Father&apos;s Native Place
                </label>
                <input
                  type="text"
                  value={fatherNativePlace}
                  onChange={(e) => setFatherNativePlace(e.target.value)}
                  placeholder="Enter father's native place"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Father&apos;s Occupation
                </label>
                <input
                  type="text"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  placeholder="Enter father's occupation"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Mother&apos;s Information
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mother&apos;s Name
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Enter mother's name"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mother&apos;s House Name
                </label>
                <input
                  type="text"
                  value={motherHouseName}
                  onChange={(e) => setMotherHouseName(e.target.value)}
                  placeholder="Enter mother's house name"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mother&apos;s Native Place
                </label>
                <input
                  type="text"
                  value={motherNativePlace}
                  onChange={(e) => setMotherNativePlace(e.target.value)}
                  placeholder="Enter mother's native place"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mother&apos;s Occupation
                </label>
                <input
                  type="text"
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  placeholder="Enter mother's occupation"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Candidate&apos;s Asset Details
              </label>
              <textarea
                value={assetDetails}
                onChange={(e) => setAssetDetails(e.target.value)}
                placeholder="Describe assets (property, land, etc.)"
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {assetDetails.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                About Candidate&apos;s Family
              </label>
              <textarea
                value={aboutFamily}
                onChange={(e) => setAboutFamily(e.target.value)}
                placeholder="Brief description about your family..."
                maxLength={5000}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {aboutFamily.length}/5000 characters
              </p>
            </div>

            <button
              type="button"
              onClick={saveFamily}
              disabled={savingSection === "family"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "family" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 4: Sibling Details */}
        <AccordionSection title="Sibling Details" isComplete={siblingComplete}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground -mt-1">Brothers</p>
            <div className="grid grid-cols-3 gap-4">
              <NumberSpinner
                label="Married"
                value={brothersMarried}
                onChange={setBrothersMarried}
              />
              <NumberSpinner
                label="Unmarried"
                value={brothersUnmarried}
                onChange={setBrothersUnmarried}
              />
              <NumberSpinner
                label="Priest"
                value={brothersPriest}
                onChange={setBrothersPriest}
              />
            </div>

            <p className="text-xs text-muted-foreground">Sisters</p>
            <div className="grid grid-cols-3 gap-4">
              <NumberSpinner
                label="Married"
                value={sistersMarried}
                onChange={setSistersMarried}
              />
              <NumberSpinner
                label="Unmarried"
                value={sistersUnmarried}
                onChange={setSistersUnmarried}
              />
              <NumberSpinner
                label="Nun"
                value={sistersNun}
                onChange={setSistersNun}
              />
            </div>

            <button
              type="button"
              onClick={saveSibling}
              disabled={savingSection === "sibling"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "sibling" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => router.push("/register-free/additional-step-two")}
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

/* ─── Number Spinner Component ─── */

function NumberSpinner({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center border border-input rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-10 w-10 flex items-center justify-center text-lg hover:bg-muted transition-colors"
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <span className="flex-1 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 flex items-center justify-center text-lg hover:bg-muted transition-colors"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
