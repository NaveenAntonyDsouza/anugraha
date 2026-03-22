"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AccordionSection } from "../accordion-section";
import { ConditionalField } from "../conditional-field";
import { OnboardingLayout } from "../onboarding-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { SearchableGroupedDropdown } from "@/components/auth/searchable-grouped-dropdown";
import {
  residentialStatusList,
  preferredCallTimeList,
  branchList,
  countryList,
} from "@/lib/reference-data";

export function AdditionalStepTwoForm() {
  const router = useRouter();
  const supabase = createClient();
  const setCompletion = useOnboardingStore((s) => s.setCompletion);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Section completion states
  const [locationComplete, setLocationComplete] = useState(false);
  const [contactComplete, setContactComplete] = useState(false);
  const [presentAddressComplete, setPresentAddressComplete] = useState(false);
  const [permanentAddressComplete, setPermanentAddressComplete] = useState(false);

  // Section 1: Location Details
  const [residingCountry, setResidingCountry] = useState("");
  const [residentialStatus, setResidentialStatus] = useState("");
  const [leaveDateFrom, setLeaveDateFrom] = useState("");
  const [leaveDateTo, setLeaveDateTo] = useState("");
  const [preferredBranch, setPreferredBranch] = useState("");

  // Section 2: Contact Details
  const [residentialPhone, setResidentialPhone] = useState("");
  const [secondaryMobile, setSecondaryMobile] = useState("");
  const [preferredCallTime, setPreferredCallTime] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [referenceRelationship, setReferenceRelationship] = useState("");
  const [referenceMobile, setReferenceMobile] = useState("");

  // Section 3: Present Address
  const [presentSameAsComm, setPresentSameAsComm] = useState(false);
  const [presentAddress, setPresentAddress] = useState("");
  const [presentPinCode, setPresentPinCode] = useState("");

  // Section 4: Permanent Address
  const [permanentSameAsComm, setPermanentSameAsComm] = useState(false);
  const [permanentSameAsPresent, setPermanentSameAsPresent] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState("");
  const [permanentPinCode, setPermanentPinCode] = useState("");

  const isNRI = residingCountry !== "" && residingCountry !== "India";
  const showPresentAddress = !presentSameAsComm;
  const showPermanentAddress = !permanentSameAsComm && !permanentSameAsPresent;

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

      // Load location info
      const { data: locationInfo } = await supabase
        .from("profile_location_info")
        .select(
          "residing_country, residential_status, outstation_leave_date_from, outstation_leave_date_to, preferred_branch"
        )
        .eq("profile_id", profile.id)
        .single();

      if (locationInfo) {
        if (locationInfo.residing_country) setResidingCountry(locationInfo.residing_country);
        if (locationInfo.residential_status) setResidentialStatus(locationInfo.residential_status);
        if (locationInfo.outstation_leave_date_from)
          setLeaveDateFrom(locationInfo.outstation_leave_date_from);
        if (locationInfo.outstation_leave_date_to)
          setLeaveDateTo(locationInfo.outstation_leave_date_to);
        if (locationInfo.preferred_branch) setPreferredBranch(locationInfo.preferred_branch);
        if (locationInfo.residing_country) setLocationComplete(true);
      }

      // Load contact info
      const { data: contactInfo } = await supabase
        .from("profile_contact_info")
        .select(
          "residential_phone_number, secondary_mobile_number, preferred_call_time, alternate_email_id, reference_name, reference_relationship, reference_mobile, present_address_same_as_comm, present_address, present_pin_zip_code, permanent_address_same_as_comm, permanent_address_same_as_present, permanent_address, permanent_pin_zip_code"
        )
        .eq("profile_id", profile.id)
        .single();

      if (contactInfo) {
        if (contactInfo.residential_phone_number)
          setResidentialPhone(contactInfo.residential_phone_number);
        if (contactInfo.secondary_mobile_number)
          setSecondaryMobile(contactInfo.secondary_mobile_number);
        if (contactInfo.preferred_call_time)
          setPreferredCallTime(contactInfo.preferred_call_time);
        if (contactInfo.alternate_email_id) setAlternateEmail(contactInfo.alternate_email_id);
        if (contactInfo.reference_name) setReferenceName(contactInfo.reference_name);
        if (contactInfo.reference_relationship)
          setReferenceRelationship(contactInfo.reference_relationship);
        if (contactInfo.reference_mobile) setReferenceMobile(contactInfo.reference_mobile);
        if (
          contactInfo.residential_phone_number ||
          contactInfo.secondary_mobile_number ||
          contactInfo.alternate_email_id
        ) {
          setContactComplete(true);
        }

        // Present address
        setPresentSameAsComm(contactInfo.present_address_same_as_comm ?? false);
        if (contactInfo.present_address) setPresentAddress(contactInfo.present_address);
        if (contactInfo.present_pin_zip_code) setPresentPinCode(contactInfo.present_pin_zip_code);
        if (contactInfo.present_address_same_as_comm || contactInfo.present_address) {
          setPresentAddressComplete(true);
        }

        // Permanent address
        setPermanentSameAsComm(contactInfo.permanent_address_same_as_comm ?? false);
        setPermanentSameAsPresent(contactInfo.permanent_address_same_as_present ?? false);
        if (contactInfo.permanent_address) setPermanentAddress(contactInfo.permanent_address);
        if (contactInfo.permanent_pin_zip_code)
          setPermanentPinCode(contactInfo.permanent_pin_zip_code);
        if (
          contactInfo.permanent_address_same_as_comm ||
          contactInfo.permanent_address_same_as_present ||
          contactInfo.permanent_address
        ) {
          setPermanentAddressComplete(true);
        }
      }

      setLoading(false);
    }
    load();
  }, [supabase, router, setCompletion]);

  async function saveLocation() {
    if (!profileId) return;
    setSavingSection("location");
    try {
      const { error } = await supabase.from("profile_location_info").upsert(
        {
          profile_id: profileId,
          residing_country: residingCountry,
          residential_status: isNRI ? residentialStatus : null,
          outstation_leave_date_from: isNRI && leaveDateFrom ? leaveDateFrom : null,
          outstation_leave_date_to: isNRI && leaveDateTo ? leaveDateTo : null,
          preferred_branch: preferredBranch || null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setLocationComplete(true);
      await refreshCompletion(profileId);
      toast.success("Location details saved");
    } catch {
      toast.error("Failed to save location details");
    } finally {
      setSavingSection(null);
    }
  }

  async function saveContact() {
    if (!profileId) return;
    setSavingSection("contact");
    try {
      const { error } = await supabase.from("profile_contact_info").upsert(
        {
          profile_id: profileId,
          residential_phone_number: residentialPhone || null,
          secondary_mobile_number: secondaryMobile || null,
          preferred_call_time: preferredCallTime || null,
          alternate_email_id: alternateEmail || null,
          reference_name: referenceName || null,
          reference_relationship: referenceRelationship || null,
          reference_mobile: referenceMobile || null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setContactComplete(true);
      await refreshCompletion(profileId);
      toast.success("Contact details saved");
    } catch {
      toast.error("Failed to save contact details");
    } finally {
      setSavingSection(null);
    }
  }

  async function savePresentAddress() {
    if (!profileId) return;
    setSavingSection("present");
    try {
      const { error } = await supabase.from("profile_contact_info").upsert(
        {
          profile_id: profileId,
          present_address_same_as_comm: presentSameAsComm,
          present_address: presentSameAsComm ? null : presentAddress || null,
          present_pin_zip_code: presentSameAsComm ? null : presentPinCode || null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setPresentAddressComplete(true);
      await refreshCompletion(profileId);
      toast.success("Present address saved");
    } catch {
      toast.error("Failed to save present address");
    } finally {
      setSavingSection(null);
    }
  }

  async function savePermanentAddress() {
    if (!profileId) return;
    setSavingSection("permanent");
    try {
      const { error } = await supabase.from("profile_contact_info").upsert(
        {
          profile_id: profileId,
          permanent_address_same_as_comm: permanentSameAsComm,
          permanent_address_same_as_present: permanentSameAsPresent,
          permanent_address: showPermanentAddress ? permanentAddress || null : null,
          permanent_pin_zip_code: showPermanentAddress ? permanentPinCode || null : null,
        },
        { onConflict: "profile_id" }
      );
      if (error) throw error;
      setPermanentAddressComplete(true);
      await refreshCompletion(profileId);
      toast.success("Permanent address saved");
    } catch {
      toast.error("Failed to save permanent address");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveAndContinue() {
    setNavigating(true);
    try {
      if (residingCountry) await saveLocation();
      if (residentialPhone || secondaryMobile || alternateEmail || referenceName) {
        await saveContact();
      }
      if (presentSameAsComm || presentAddress) await savePresentAddress();
      if (permanentSameAsComm || permanentSameAsPresent || permanentAddress) {
        await savePermanentAddress();
      }
      router.push("/register-free/partner-preference");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setNavigating(false);
    }
  }

  if (loading) {
    return (
      <OnboardingLayout currentStep={2}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={2}>
      <div className="space-y-4">
        {/* Section 1: Location Details */}
        <AccordionSection
          title="Location Details"
          isComplete={locationComplete}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Residing Country
              </label>
              <SearchableGroupedDropdown
                groups={countryList}
                value={residingCountry}
                onChange={setResidingCountry}
                placeholder="Select residing country"
              />
            </div>

            <ConditionalField condition={isNRI}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Residential Status
                  </label>
                  <select
                    value={residentialStatus}
                    onChange={(e) => setResidentialStatus(e.target.value)}
                    className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select status</option>
                    {residentialStatusList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Next Leave Date (From)
                    </label>
                    <input
                      type="date"
                      value={leaveDateFrom}
                      onChange={(e) => setLeaveDateFrom(e.target.value)}
                      className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Next Leave Date (To)
                    </label>
                    <input
                      type="date"
                      value={leaveDateTo}
                      onChange={(e) => setLeaveDateTo(e.target.value)}
                      className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </ConditionalField>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Branch
              </label>
              <select
                value={preferredBranch}
                onChange={(e) => setPreferredBranch(e.target.value)}
                className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select branch</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={saveLocation}
              disabled={savingSection === "location"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "location" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 2: Contact Details */}
        <AccordionSection title="Contact Details" isComplete={contactComplete}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Residential Phone Number
                </label>
                <input
                  type="tel"
                  value={residentialPhone}
                  onChange={(e) => setResidentialPhone(e.target.value)}
                  placeholder="Enter landline number"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Secondary Mobile Number
                </label>
                <input
                  type="tel"
                  value={secondaryMobile}
                  onChange={(e) => setSecondaryMobile(e.target.value)}
                  placeholder="Enter secondary mobile"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred Call Time
                </label>
                <select
                  value={preferredCallTime}
                  onChange={(e) => setPreferredCallTime(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select time</option>
                  {preferredCallTimeList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alternate Email ID
                </label>
                <input
                  type="email"
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                  placeholder="Enter alternate email"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Reference Person</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={referenceName}
                  onChange={(e) => setReferenceName(e.target.value)}
                  placeholder="Reference name"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={referenceRelationship}
                  onChange={(e) => setReferenceRelationship(e.target.value)}
                  placeholder="e.g., Uncle"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input
                  type="tel"
                  value={referenceMobile}
                  onChange={(e) => setReferenceMobile(e.target.value)}
                  placeholder="Mobile number"
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveContact}
              disabled={savingSection === "contact"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "contact" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 3: Present Address */}
        <AccordionSection
          title="Present Address"
          isComplete={presentAddressComplete}
        >
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={presentSameAsComm}
                onChange={(e) => setPresentSameAsComm(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">Same as communication address</span>
            </label>

            <ConditionalField condition={showPresentAddress}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Present Address
                  </label>
                  <textarea
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                    placeholder="Enter your present address"
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {presentAddress.length}/200 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    PIN/ZIP Code
                  </label>
                  <input
                    type="text"
                    value={presentPinCode}
                    onChange={(e) => setPresentPinCode(e.target.value)}
                    placeholder="Enter PIN/ZIP code"
                    className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
            </ConditionalField>

            <button
              type="button"
              onClick={savePresentAddress}
              disabled={savingSection === "present"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "present" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </AccordionSection>

        {/* Section 4: Permanent Address */}
        <AccordionSection
          title="Permanent Address"
          isComplete={permanentAddressComplete}
        >
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permanentSameAsComm}
                onChange={(e) => setPermanentSameAsComm(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">Same as communication address</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permanentSameAsPresent}
                onChange={(e) => setPermanentSameAsPresent(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">Same as present address</span>
            </label>

            <ConditionalField condition={showPermanentAddress}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Permanent Address
                  </label>
                  <textarea
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Enter your permanent address"
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {permanentAddress.length}/200 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    PIN/ZIP Code
                  </label>
                  <input
                    type="text"
                    value={permanentPinCode}
                    onChange={(e) => setPermanentPinCode(e.target.value)}
                    placeholder="Enter PIN/ZIP code"
                    className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
            </ConditionalField>

            <button
              type="button"
              onClick={savePermanentAddress}
              disabled={savingSection === "permanent"}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "permanent" && (
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
          onClick={() => router.push("/register-free/partner-preference")}
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
