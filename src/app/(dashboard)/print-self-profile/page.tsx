"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

interface SectionData {
  label: string;
  value: string | number | null | undefined;
}

export default function PrintSelfProfilePage() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile: Record<string, unknown>;
    primary: Record<string, unknown>;
    religious: Record<string, unknown>;
    education: Record<string, unknown>;
    family: Record<string, unknown>;
    sibling: Record<string, unknown>;
    location: Record<string, unknown>;
    contact: Record<string, unknown>;
    lifestyle: Record<string, unknown>;
    social: Record<string, unknown>;
    partner: Record<string, unknown>;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }

    const [
      { data: profileData },
      { data: primaryData },
      { data: religiousData },
      { data: educationData },
      { data: familyData },
      { data: siblingData },
      { data: locationData },
      { data: contactData },
      { data: lifestyleData },
      { data: socialData },
      { data: partnerData },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", profile.id).single(),
      supabase.from("profile_primary_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_religious_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_education_profession").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_family_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_sibling_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_location_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_contact_info").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_lifestyle_hobbies").select("*").eq("profile_id", profile.id).single(),
      supabase.from("profile_social_media").select("*").eq("profile_id", profile.id).single(),
      supabase.from("partner_preferences").select("*").eq("profile_id", profile.id).single(),
    ]);

    setData({
      profile: profileData ?? {},
      primary: primaryData ?? {},
      religious: religiousData ?? {},
      education: educationData ?? {},
      family: familyData ?? {},
      sibling: siblingData ?? {},
      location: locationData ?? {},
      contact: contactData ?? {},
      lifestyle: lifestyleData ?? {},
      social: socialData ?? {},
      partner: partnerData ?? {},
    });
    setLoading(false);
  }, [profile, authLoading, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fmt = (v: unknown): string => {
    if (v === null || v === undefined || v === "") return "—";
    if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "—";
    return String(v);
  };

  const sections: { title: string; rows: SectionData[] }[] = [
    {
      title: "Primary Information",
      rows: [
        { label: "Height", value: fmt(data.primary.height) },
        { label: "Weight", value: fmt(data.primary.weight) },
        { label: "Complexion", value: fmt(data.primary.complexion) },
        { label: "Body Type", value: fmt(data.primary.body_type) },
        { label: "Physical Status", value: fmt(data.primary.physical_status) },
        { label: "Marital Status", value: fmt(data.primary.marital_status) },
        { label: "Family Status", value: fmt(data.primary.family_status) },
        { label: "Blood Group", value: fmt(data.primary.blood_group) },
        { label: "Mother Tongue", value: fmt(data.primary.mother_tongue) },
        { label: "About", value: fmt(data.primary.about_the_candidate) },
      ],
    },
    {
      title: "Religious Information",
      rows: [
        { label: "Religion", value: fmt(data.religious.religion) },
        { label: "Denomination", value: fmt(data.religious.denomination) },
        { label: "Diocese", value: fmt(data.religious.diocese) },
        { label: "Parish", value: fmt(data.religious.parish_name_place) },
        { label: "Caste / Community", value: fmt(data.religious.caste_community) },
        { label: "Rasi", value: fmt(data.religious.rasi) },
        { label: "Nakshatra", value: fmt(data.religious.nakshatra) },
        { label: "Gothram", value: fmt(data.religious.gothram) },
      ],
    },
    {
      title: "Education & Profession",
      rows: [
        { label: "Education", value: fmt(data.education.educational_qualifications) },
        { label: "Education Level", value: fmt(data.education.education_level) },
        { label: "Occupation", value: fmt(data.education.occupation_category) },
        { label: "Employment", value: fmt(data.education.employment_category) },
        { label: "Working Country", value: fmt(data.education.working_country) },
        { label: "Working State", value: fmt(data.education.working_state) },
        { label: "Annual Income", value: fmt(data.education.annual_income) },
        { label: "Organization", value: fmt(data.education.organization_name) },
      ],
    },
    {
      title: "Family Information",
      rows: [
        { label: "Father's Name", value: fmt(data.family.father_name) },
        { label: "Father's Occupation", value: fmt(data.family.father_occupation) },
        { label: "Mother's Name", value: fmt(data.family.mother_name) },
        { label: "Mother's Occupation", value: fmt(data.family.mother_occupation) },
        { label: "Brothers (Married)", value: fmt(data.sibling.brothers_married) },
        { label: "Brothers (Unmarried)", value: fmt(data.sibling.brothers_unmarried) },
        { label: "Sisters (Married)", value: fmt(data.sibling.sisters_married) },
        { label: "Sisters (Unmarried)", value: fmt(data.sibling.sisters_unmarried) },
        { label: "About Family", value: fmt(data.family.about_candidate_family) },
      ],
    },
    {
      title: "Location Information",
      rows: [
        { label: "Native Country", value: fmt(data.location.native_country) },
        { label: "Native State", value: fmt(data.location.native_state) },
        { label: "Native District", value: fmt(data.location.native_district) },
        { label: "Residing Country", value: fmt(data.location.residing_country) },
        { label: "Residential Status", value: fmt(data.location.residential_status) },
      ],
    },
    {
      title: "Contact Information",
      rows: [
        { label: "Mobile", value: fmt(data.contact.mobile_number) },
        { label: "WhatsApp", value: fmt(data.contact.whatsapp_number) },
        { label: "Email", value: fmt(data.contact.email) },
        { label: "Communication Address", value: fmt(data.contact.communication_address) },
        { label: "PIN / ZIP", value: fmt(data.contact.pin_zip_code) },
      ],
    },
    {
      title: "Hobbies & Interests",
      rows: [
        { label: "Eating Habits", value: fmt(data.lifestyle.eating_habits) },
        { label: "Drinking Habits", value: fmt(data.lifestyle.drinking_habits) },
        { label: "Smoking Habits", value: fmt(data.lifestyle.smoking_habits) },
        { label: "Hobbies", value: fmt(data.lifestyle.hobbies) },
        { label: "Music", value: fmt(data.lifestyle.favorite_music) },
        { label: "Cuisine", value: fmt(data.lifestyle.favorite_cuisine) },
        { label: "Languages", value: fmt(data.lifestyle.spoken_languages) },
      ],
    },
    {
      title: "Partner Preferences",
      rows: [
        {
          label: "Age Range",
          value: data.partner.pref_min_age
            ? `${data.partner.pref_min_age} to ${data.partner.pref_max_age}`
            : "—",
        },
        {
          label: "Height Range",
          value: data.partner.pref_min_height
            ? `${data.partner.pref_min_height} to ${data.partner.pref_max_height}`
            : "—",
        },
        { label: "Marital Status", value: fmt(data.partner.pref_marital_status) },
        { label: "Religion", value: fmt(data.partner.pref_religion) },
        { label: "Education", value: fmt(data.partner.pref_education_level) },
        { label: "Occupation", value: fmt(data.partner.pref_occupation_category) },
        { label: "Working Country", value: fmt(data.partner.pref_working_country) },
      ],
    },
  ];

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          header, footer, nav, .print-hide {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-container max-w-4xl mx-auto px-4 py-6">
        {/* Print button - hidden when printing */}
        <div className="print-hide flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Print Profile</h1>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        {/* Header */}
        <div className="print-section text-center mb-6 pb-4 border-b border-input">
          <h2 className="text-2xl font-bold text-foreground">
            {fmt(data.profile.full_name)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fmt(data.profile.anugraha_id)} | Anugraha Matrimony
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="print-section">
              <h3 className="text-sm font-bold text-foreground bg-muted/50 px-3 py-2 rounded mb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-3">
                {section.rows.map((row) => (
                  <div key={row.label} className="flex gap-2 py-1 text-sm">
                    <span className="text-muted-foreground min-w-[140px] flex-shrink-0">
                      {row.label}:
                    </span>
                    <span className="text-foreground font-medium">
                      {row.value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer for print */}
        <div className="print-section mt-8 pt-4 border-t border-input text-center">
          <p className="text-xs text-muted-foreground">
            Generated from anugrahamatrimony.com | {new Date().toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </>
  );
}
