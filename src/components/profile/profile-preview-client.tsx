"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye, ArrowLeft, Camera, ShieldCheck, ShieldX,
  Phone, Calendar, Lock, User, Heart, Users, Contact,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailRow } from "@/components/profile/detail-row";
import { TagPillRow } from "@/components/profile/tag-pill";

type Tab = "personal" | "partner" | "family" | "contact";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProfilePreviewClientProps { profile: any; isPremium: boolean; }

function unwrap<T>(val: T | T[]): T | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export function ProfilePreviewClient({ profile, isPremium }: ProfilePreviewClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const primary = unwrap(profile.profile_primary_info);
  const religious = unwrap(profile.profile_religious_info);
  const education = unwrap(profile.profile_education_profession);
  const family = unwrap(profile.profile_family_info);
  const sibling = unwrap(profile.profile_sibling_info);
  const location = unwrap(profile.profile_location_info);
  const contact = unwrap(profile.profile_contact_info);
  const lifestyle = unwrap(profile.profile_lifestyle_hobbies);
  const social = unwrap(profile.profile_social_media);
  const partner = unwrap(profile.partner_preferences);
  const photos = Array.isArray(profile.profile_photos) ? profile.profile_photos : [];

  const profilePhoto = photos.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.photo_type === "profile" && p.is_visible !== false
  );
  const photoCount = photos.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.is_visible !== false
  ).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "personal", label: "Personal Details", icon: <User className="h-4 w-4" /> },
    { id: "partner", label: "Partner Preferences", icon: <Heart className="h-4 w-4" /> },
    { id: "family", label: "Family Details", icon: <Users className="h-4 w-4" /> },
    { id: "contact", label: "Contact Details", icon: <Contact className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/my-home/view-and-edit" className="hover:text-primary">View &amp; Edit</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Profile Preview</span>
      </nav>

      {/* Preview Banner */}
      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
        <Eye className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">
          This is a preview of how your profile appears to other members.
        </p>
        <Link
          href="/my-home/view-and-edit"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Edit
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── LEFT SIDEBAR ─── */}
        <div className="w-full lg:w-[280px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input p-5 text-center sticky top-20">
            {/* Photo */}
            <div className="relative w-[200px] h-[200px] mx-auto mb-4 rounded-lg bg-muted overflow-hidden">
              {profilePhoto?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhoto.photo_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-5xl font-bold text-muted-foreground">
                    {profile.full_name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              {photoCount > 0 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {photoCount}
                </div>
              )}
            </div>

            {/* Name & ID */}
            <h2 className="text-lg font-bold text-foreground">{profile.full_name}</h2>
            <p className="text-sm text-primary font-medium mt-0.5">{profile.anugraha_id}</p>

            {/* Verification badges */}
            <div className="mt-4 space-y-2 text-left px-2">
              <div className="flex items-center gap-2 text-xs">
                {profile.id_proof_verified ? (
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <ShieldX className="h-4 w-4 text-destructive" />
                )}
                <span className={profile.id_proof_verified ? "text-green-700" : "text-muted-foreground"}>
                  {profile.id_proof_verified ? "ID Proof Verified" : "ID Proof Not Verified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Mobile Number Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last Login : {new Date(profile.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT CONTENT ─── */}
        <div className="flex-1 min-w-0">
          {/* Tab Bar */}
          <div className="flex border-b border-input mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ PERSONAL DETAILS TAB ═══ */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <Section title="Primary Information" editHref="/my-home/view-and-edit/primary-info-edit">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <DetailRow label="Full Name" value={profile.full_name} />
                  <DetailRow label="Gender" value={profile.gender} />
                  <DetailRow label="Date of Birth" value={profile.date_of_birth} />
                  <DetailRow label="Age" value={profile.age ? `${profile.age} Yrs` : null} />
                  <DetailRow label="Height" value={primary?.height} />
                  <DetailRow label="Weight" value={primary?.weight} />
                  <DetailRow label="Complexion" value={primary?.complexion} />
                  <DetailRow label="Body Type" value={primary?.body_type} />
                  <DetailRow label="Blood Group" value={primary?.blood_group} />
                  <DetailRow label="Mother Tongue" value={primary?.mother_tongue} />
                  <DetailRow label="Marital Status" value={primary?.marital_status} />
                  <DetailRow label="Physical Status" value={primary?.physical_status} />
                  <DetailRow label="About the Candidate" value={primary?.about_the_candidate} />
                </div>
              </Section>

              <Section title="Religious Information" editHref="/my-home/view-and-edit/religious-info-edit">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <DetailRow label="Religion" value={religious?.religion} />
                  <DetailRow label="Denomination" value={religious?.denomination} />
                  <DetailRow label="Diocese Name" value={religious?.diocese} />
                  <DetailRow label="Parish Name and Place" value={religious?.parish_name_place} />
                  <DetailRow label="Caste / Community" value={religious?.caste_community} />
                  <DetailRow label="Sub-Caste" value={religious?.sub_caste_community} />
                  <DetailRow label="Rasi" value={religious?.rasi} />
                  <DetailRow label="Nakshatra" value={religious?.nakshatra} />
                  <DetailRow label="Gothram" value={religious?.gothram} />
                </div>
              </Section>

              <Section title="Education & Profession" editHref="/my-home/view-and-edit/education-profession-edit">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <DetailRow label="Educational Qualifications" value={education?.educational_qualifications} />
                  <DetailRow label="Education in Detail" value={education?.education_level} />
                  <DetailRow label="Occupation Category" value={education?.occupation_category} />
                  <DetailRow label="Occupation in Detail" value={education?.occupation_in_detail} />
                  <DetailRow label="Employment Category" value={education?.employment_category} />
                  <DetailRow label="Organization Name" value={education?.organization_name} />
                  <DetailRow label="Working Country" value={education?.working_country} />
                  <DetailRow label="Working State" value={education?.working_state} />
                  <DetailRow label="Working District" value={education?.working_district} />
                  <DetailRow label="Annual Income" value={education?.annual_income} />
                </div>
              </Section>

              <Section title="Location Information" editHref="/my-home/view-and-edit/location-info-edit">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <DetailRow label="Native Country" value={location?.native_country} />
                  <DetailRow label="Native State" value={location?.native_state} />
                  <DetailRow label="Native District" value={location?.native_district} />
                  <DetailRow label="Residing Country" value={location?.residing_country} />
                  <DetailRow label="Residential Status" value={location?.residential_status} />
                </div>
              </Section>

              <Section title="Hobbies & Interests" editHref="/my-home/view-and-edit/lifestyle-hobbies-edit">
                <DetailRow label="Hobbies" value={null} />
                <TagPillRow label="Favorite Music" values={lifestyle?.favorite_music} />
                <DetailRow label="Preferred Movies" value={lifestyle?.preferred_movies} />
                <DetailRow label="Preferred Dress" value={lifestyle?.preferred_dress} />
                <DetailRow label="Sports / Fitness / Games" value={lifestyle?.sports_fitness} />
                <TagPillRow label="Favorite Cuisine" values={lifestyle?.favorite_cuisine} />
                <TagPillRow label="Spoken Languages" values={lifestyle?.spoken_languages} />
                <DetailRow label="Cultural Background" value={lifestyle?.cultural_background} />
                <DetailRow label="Eating Habits" value={lifestyle?.eating_habits} />
                <DetailRow label="Drinking Habits" value={lifestyle?.drinking_habits} />
                <DetailRow label="Smoking Habits" value={lifestyle?.smoking_habits} />
              </Section>
            </div>
          )}

          {/* ═══ PARTNER PREFERENCES TAB ═══ */}
          {activeTab === "partner" && (
            <div className="space-y-4">
              <Section title="Partner Preferences" editHref="/my-home/view-and-edit/partner-preference-edit">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <DetailRow
                    label="Age Preferred"
                    value={partner ? `${partner.pref_min_age ?? "—"} Yrs - ${partner.pref_max_age ?? "—"} Yrs` : null}
                  />
                  <DetailRow
                    label="Height Preferred"
                    value={partner ? `${partner.pref_min_height ?? "—"} - ${partner.pref_max_height ?? "—"}` : null}
                  />
                </div>
                <DetailRow label="Denomination" value={partner?.pref_denomination?.join(", ") ?? "Any"} />
                <DetailRow label="Complexion" value={partner?.pref_complexion?.join(", ") ?? "Any"} />
                <DetailRow label="Body Type" value={partner?.pref_body_type?.join(", ") ?? "Any"} />
                <TagPillRow label="Marital Status" values={partner?.pref_marital_status} />
                <DetailRow label="Children Preference" value={partner?.pref_children_preference ?? "Any"} />
                <DetailRow label="Physical Status" value={partner?.pref_physical_status?.join(", ") ?? "Any"} />
                <DetailRow label="Family Status" value={partner?.pref_family_status?.join(", ") ?? "Any"} />
              </Section>

              <Section title="Education & Professional Requirements" editHref="/my-home/view-and-edit/partner-preference-edit">
                <DetailRow label="Education" value={partner?.pref_education_level?.join(", ") ?? "Any"} />
                <DetailRow label="Occupation" value={partner?.pref_occupation_category?.join(", ") ?? "Any"} />
                <DetailRow label="Employment Category" value={partner?.pref_employment_category?.join(", ") ?? "Any"} />
                <DetailRow label="Annual Income" value={partner?.pref_annual_income ?? "Any"} />
                <DetailRow label="Working Country" value={partner?.pref_working_country?.join(", ") ?? "India"} />
                <DetailRow label="Working State" value={partner?.pref_working_state?.join(", ") ?? "Karnataka"} />
              </Section>

              <Section title="Location Requirements" editHref="/my-home/view-and-edit/partner-preference-edit">
                <DetailRow label="Native Country" value={partner?.pref_native_country?.join(", ") ?? "India"} />
                <DetailRow label="Native State" value={partner?.pref_native_state?.join(", ") ?? "Karnataka"} />
                <DetailRow label="Expectations about the partner in detail" value={partner?.pref_description ?? "Any"} />
              </Section>
            </div>
          )}

          {/* ═══ FAMILY DETAILS TAB (Premium Only) ═══ */}
          {activeTab === "family" && (
            <div className="space-y-4">
              {!isPremium ? (
                <PremiumGate tabName="Family Details" />
              ) : (
                <>
                  <Section title="Family Information" editHref="/my-home/view-and-edit/family-info-edit">
                    <DetailRow label="Family Status" value={primary?.family_status} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <DetailRow label="Father&apos;s Name" value={family?.father_name} />
                      <DetailRow label="Mother&apos;s Name" value={family?.mother_name} />
                      <DetailRow label="Father&apos;s House Name" value={family?.father_house_name} />
                      <DetailRow label="Mother&apos;s House Name" value={family?.mother_house_name} />
                      <DetailRow label="Father&apos;s Native Place" value={family?.father_native_place} />
                      <DetailRow label="Mother&apos;s Native Place" value={family?.mother_native_place} />
                      <DetailRow label="Father&apos;s Occupation" value={family?.father_occupation} />
                      <DetailRow label="Mother&apos;s Occupation" value={family?.mother_occupation} />
                    </div>
                  </Section>

                  <Section title="Sibling Details" editHref="/my-home/view-and-edit/family-info-edit">
                    <h4 className="text-xs font-semibold text-primary mb-2">No. of Brothers</h4>
                    <div className="grid grid-cols-3 gap-x-4 mb-4">
                      <DetailRow label="Married" value={sibling?.brothers_married} />
                      <DetailRow label="UnMarried" value={sibling?.brothers_unmarried} />
                      <DetailRow label="Priest" value={sibling?.brothers_priest} />
                    </div>
                    <h4 className="text-xs font-semibold text-primary mb-2">No. of Sisters</h4>
                    <div className="grid grid-cols-3 gap-x-4 mb-4">
                      <DetailRow label="Married" value={sibling?.sisters_married} />
                      <DetailRow label="UnMarried" value={sibling?.sisters_unmarried} />
                      <DetailRow label="Nun" value={sibling?.sisters_nun} />
                    </div>
                    <DetailRow label="Candidate&apos;s Asset Details" value={family?.candidate_asset_details} />
                    <DetailRow label="About Candidate&apos;s Family" value={family?.about_candidate_family} />
                  </Section>

                  <Section title="Profile Created By">
                    <DetailRow label="Profile Created By" value={profile.created_by} />
                  </Section>
                </>
              )}
            </div>
          )}

          {/* ═══ CONTACT DETAILS TAB (Premium Only) ═══ */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              {!isPremium ? (
                <PremiumGate tabName="Contact Details" />
              ) : (
                <>
                  <Section title="Primary Contact Details" editHref="/my-home/view-and-edit/contact-info-edit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <DetailRow label="Mobile Number" value={contact?.mobile_number} />
                      <DetailRow label="Custodian Name" value={contact?.custodian_name} />
                      <DetailRow label="Custodian Relation" value={contact?.custodian_relation} />
                      <DetailRow label="Preferred Time To Reach You" value={contact?.preferred_call_time} />
                    </div>
                  </Section>

                  <Section title="Other Contact Details" editHref="/my-home/view-and-edit/contact-info-edit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <DetailRow label="Residential Landline No." value={contact?.residential_phone_number} />
                      <DetailRow label="WhatsApp Number" value={contact?.whatsapp_number} />
                      <DetailRow label="Secondary Mobile No." value={contact?.secondary_mobile_number} />
                    </div>
                  </Section>

                  <Section title="Candidate&apos;s Address" editHref="/my-home/view-and-edit/contact-info-edit">
                    <DetailRow label="Communication Address" value={contact?.communication_address} />
                    <DetailRow label="Present Address" value={contact?.present_address} />
                    <DetailRow label="Permanent Address" value={contact?.permanent_address} />
                  </Section>

                  <Section title="Reference Person&apos;s Details" editHref="/my-home/view-and-edit/contact-info-edit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <DetailRow label="Name" value={contact?.reference_name} />
                      <DetailRow label="Relationship with Candidate" value={contact?.reference_relationship} />
                    </div>
                    <DetailRow label="Mobile No." value={contact?.reference_mobile} />
                  </Section>

                  <Section title="Social Media Information" editHref="/my-home/view-and-edit/social-media-edit">
                    <DetailRow label="Facebook" value={social?.facebook} />
                    <DetailRow label="Instagram" value={social?.instagram} />
                    <DetailRow label="LinkedIn" value={social?.linkedin} />
                    <DetailRow label="YouTube" value={social?.youtube} />
                    <DetailRow label="Website" value={social?.website} />
                  </Section>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Section wrapper with optional edit button ─── */
function Section({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-input relative">
      <h2 className="text-base font-semibold text-primary px-5 py-3 border-b border-input">
        {title}
      </h2>
      <div className="px-5 py-3">{children}</div>
      {editHref && (
        <Link
          href={editHref}
          className="absolute top-3 right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ─── Premium gate overlay ─── */
function PremiumGate({ tabName }: { tabName: string }) {
  return (
    <div className="bg-white rounded-lg border border-input p-12 text-center">
      <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {tabName} — Premium Only
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {tabName} are visible only to premium members. Upgrade your membership to view complete details.
      </p>
      <Link
        href="/membership-plans"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Upgrade to Premium
      </Link>
    </div>
  );
}
