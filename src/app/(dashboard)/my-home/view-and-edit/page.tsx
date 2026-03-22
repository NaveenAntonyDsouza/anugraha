import Link from "next/link";
import { ChevronDown, Pencil, User, BookOpen, GraduationCap, Users, MapPin, Phone, Heart, Share2, Handshake } from "lucide-react";
import { getMyProfileData } from "@/lib/profile-data";
import { DetailRow } from "@/components/profile/detail-row";
import { TagPillRow } from "@/components/profile/tag-pill";

const SECTIONS = [
  {
    key: "primary",
    title: "Primary Information",
    icon: User,
    editHref: "/my-home/view-and-edit/primary-info-edit",
  },
  {
    key: "religious",
    title: "Religious Information",
    icon: BookOpen,
    editHref: "/my-home/view-and-edit/religious-info-edit",
  },
  {
    key: "education",
    title: "Education & Profession",
    icon: GraduationCap,
    editHref: "/my-home/view-and-edit/education-profession-edit",
  },
  {
    key: "family",
    title: "Family Information",
    icon: Users,
    editHref: "/my-home/view-and-edit/family-info-edit",
  },
  {
    key: "location",
    title: "Location Information",
    icon: MapPin,
    editHref: "/my-home/view-and-edit/location-info-edit",
  },
  {
    key: "contact",
    title: "Contact Information",
    icon: Phone,
    editHref: "/my-home/view-and-edit/contact-info-edit",
  },
  {
    key: "lifestyle",
    title: "Hobbies & Interests",
    icon: Heart,
    editHref: "/my-home/view-and-edit/lifestyle-hobbies-edit",
  },
  {
    key: "social",
    title: "Social Media Information",
    icon: Share2,
    editHref: "/my-home/view-and-edit/social-media-edit",
  },
  {
    key: "partner",
    title: "Partner Preferences",
    icon: Handshake,
    editHref: "/my-home/view-and-edit/partner-preference-edit",
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default async function ViewAndEditOverviewPage() {
  const profile = await getMyProfileData();

  const primary = Array.isArray(profile.profile_primary_info)
    ? profile.profile_primary_info[0]
    : profile.profile_primary_info;
  const religious = Array.isArray(profile.profile_religious_info)
    ? profile.profile_religious_info[0]
    : profile.profile_religious_info;
  const education = Array.isArray(profile.profile_education_profession)
    ? profile.profile_education_profession[0]
    : profile.profile_education_profession;
  const family = Array.isArray(profile.profile_family_info)
    ? profile.profile_family_info[0]
    : profile.profile_family_info;
  const sibling = Array.isArray(profile.profile_sibling_info)
    ? profile.profile_sibling_info[0]
    : profile.profile_sibling_info;
  const location = Array.isArray(profile.profile_location_info)
    ? profile.profile_location_info[0]
    : profile.profile_location_info;
  const contact = Array.isArray(profile.profile_contact_info)
    ? profile.profile_contact_info[0]
    : profile.profile_contact_info;
  const lifestyle = Array.isArray(profile.profile_lifestyle_hobbies)
    ? profile.profile_lifestyle_hobbies[0]
    : profile.profile_lifestyle_hobbies;
  const social = Array.isArray(profile.profile_social_media)
    ? profile.profile_social_media[0]
    : profile.profile_social_media;
  const partner = Array.isArray(profile.partner_preferences)
    ? profile.partner_preferences[0]
    : profile.partner_preferences;

  function renderContent(key: SectionKey) {
    switch (key) {
      case "primary":
        return (
          <>
            <DetailRow label="Height" value={primary?.height} />
            <DetailRow label="Weight" value={primary?.weight} />
            <DetailRow label="Complexion" value={primary?.complexion} />
            <DetailRow label="Body Type" value={primary?.body_type} />
            <DetailRow label="Physical Status" value={primary?.physical_status} />
            <DetailRow label="Marital Status" value={primary?.marital_status} />
            <DetailRow label="Family Status" value={primary?.family_status} />
            <DetailRow label="Blood Group" value={primary?.blood_group} />
            <DetailRow label="Mother Tongue" value={primary?.mother_tongue} />
            <DetailRow label="About" value={primary?.about_the_candidate} />
          </>
        );
      case "religious":
        return (
          <>
            <DetailRow label="Religion" value={religious?.religion} />
            <DetailRow label="Denomination" value={religious?.denomination} />
            <DetailRow label="Diocese" value={religious?.diocese} />
            <DetailRow label="Parish" value={religious?.parish_name_place} />
            <DetailRow label="Caste / Community" value={religious?.caste_community} />
            <DetailRow label="Sub-Caste" value={religious?.sub_caste_community} />
            <DetailRow label="Rasi" value={religious?.rasi} />
            <DetailRow label="Nakshatra" value={religious?.nakshatra} />
            <DetailRow label="Gothram" value={religious?.gothram} />
          </>
        );
      case "education":
        return (
          <>
            <DetailRow label="Education" value={education?.educational_qualifications} />
            <DetailRow label="Education Level" value={education?.education_level} />
            <DetailRow label="Occupation" value={education?.occupation_category} />
            <DetailRow label="Employment" value={education?.employment_category} />
            <DetailRow label="Working Country" value={education?.working_country} />
            <DetailRow label="Working State" value={education?.working_state} />
            <DetailRow label="Annual Income" value={education?.annual_income} />
            <DetailRow label="Organization" value={education?.organization_name} />
          </>
        );
      case "family":
        return (
          <>
            <DetailRow label="Father's Name" value={family?.father_name} />
            <DetailRow label="Father's Occupation" value={family?.father_occupation} />
            <DetailRow label="Mother's Name" value={family?.mother_name} />
            <DetailRow label="Mother's Occupation" value={family?.mother_occupation} />
            <DetailRow label="Brothers (Married)" value={sibling?.brothers_married} />
            <DetailRow label="Brothers (Unmarried)" value={sibling?.brothers_unmarried} />
            <DetailRow label="Sisters (Married)" value={sibling?.sisters_married} />
            <DetailRow label="Sisters (Unmarried)" value={sibling?.sisters_unmarried} />
          </>
        );
      case "location":
        return (
          <>
            <DetailRow label="Native Country" value={location?.native_country} />
            <DetailRow label="Native State" value={location?.native_state} />
            <DetailRow label="Native District" value={location?.native_district} />
            <DetailRow label="Residing Country" value={location?.residing_country} />
            <DetailRow label="Residential Status" value={location?.residential_status} />
            <DetailRow label="Preferred Branch" value={location?.preferred_branch} />
          </>
        );
      case "contact":
        return (
          <>
            <DetailRow label="Mobile" value={contact?.mobile_number} />
            <DetailRow label="WhatsApp" value={contact?.whatsapp_number} />
            <DetailRow label="Communication Address" value={contact?.communication_address} />
            <DetailRow label="PIN / ZIP" value={contact?.pin_zip_code} />
            <DetailRow label="Preferred Call Time" value={contact?.preferred_call_time} />
          </>
        );
      case "lifestyle":
        return (
          <>
            <DetailRow label="Eating Habits" value={lifestyle?.eating_habits} />
            <DetailRow label="Drinking Habits" value={lifestyle?.drinking_habits} />
            <DetailRow label="Smoking Habits" value={lifestyle?.smoking_habits} />
            <DetailRow label="Cultural Background" value={lifestyle?.cultural_background} />
            <TagPillRow label="Hobbies" values={lifestyle?.hobbies} />
            <TagPillRow label="Music" values={lifestyle?.favorite_music} />
            <TagPillRow label="Cuisine" values={lifestyle?.favorite_cuisine} />
            <TagPillRow label="Languages" values={lifestyle?.spoken_languages} />
          </>
        );
      case "social":
        return (
          <>
            <DetailRow label="Facebook" value={social?.facebook} />
            <DetailRow label="Instagram" value={social?.instagram} />
            <DetailRow label="LinkedIn" value={social?.linkedin} />
            <DetailRow label="YouTube" value={social?.youtube} />
            <DetailRow label="Website" value={social?.website} />
          </>
        );
      case "partner":
        return (
          <>
            <DetailRow label="Age Range" value={partner ? `${partner.pref_min_age ?? "—"} to ${partner.pref_max_age ?? "—"}` : null} />
            <DetailRow label="Height Range" value={partner ? `${partner.pref_min_height ?? "—"} to ${partner.pref_max_height ?? "—"}` : null} />
            <TagPillRow label="Marital Status" values={partner?.pref_marital_status} />
            <TagPillRow label="Religion" values={partner?.pref_religion} />
            <TagPillRow label="Education" values={partner?.pref_education_level} />
            <TagPillRow label="Occupation" values={partner?.pref_occupation_category} />
            <TagPillRow label="Working Country" values={partner?.pref_working_country} />
          </>
        );
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">
          My Home
        </Link>
        <span>/</span>
        <span className="text-foreground">View & Edit My Profile</span>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((section) => (
          <details key={section.key} className="group bg-white rounded-lg border border-input">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {section.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={section.editHref}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </div>
            </summary>
            <div className="px-4 pb-4 border-t border-input pt-3">
              {renderContent(section.key)}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
