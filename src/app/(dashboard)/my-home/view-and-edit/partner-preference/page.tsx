import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";
import { TagPillRow } from "@/components/profile/tag-pill";

export default async function PartnerPreferencePage() {
  const profile = await getMyProfileData();
  const pref = Array.isArray(profile.partner_preferences)
    ? profile.partner_preferences[0]
    : profile.partner_preferences;

  return (
    <SectionViewCard title="Partner Preferences" editHref="/my-home/view-and-edit/partner-preference-edit">
      {/* Basic */}
      <DetailRow
        label="Age Range"
        value={pref ? `${pref.pref_min_age ?? "\u2014"} to ${pref.pref_max_age ?? "\u2014"}` : null}
      />
      <DetailRow
        label="Height Range"
        value={pref ? `${pref.pref_min_height ?? "\u2014"} to ${pref.pref_max_height ?? "\u2014"}` : null}
      />
      <TagPillRow label="Marital Status" values={pref?.pref_marital_status} />
      <TagPillRow label="Children Status" values={pref?.pref_children_status} />
      <TagPillRow label="Complexion" values={pref?.pref_complexion} />
      <TagPillRow label="Body Type" values={pref?.pref_body_type} />
      <TagPillRow label="Physical Status" values={pref?.pref_physical_status} />
      <TagPillRow label="Family Status" values={pref?.pref_family_status} />

      <div className="my-2 border-t border-input" />

      {/* Religious */}
      <TagPillRow label="Religion" values={pref?.pref_religion} />
      <TagPillRow label="Denomination" values={pref?.pref_denomination} />
      <TagPillRow label="Diocese" values={pref?.pref_diocese} />
      <TagPillRow label="Caste" values={pref?.pref_caste} />
      <TagPillRow label="Sub-Caste" values={pref?.pref_sub_caste} />
      <TagPillRow label="Muslim Sect" values={pref?.pref_muslim_sect} />
      <TagPillRow label="Muslim Community" values={pref?.pref_muslim_community} />
      <TagPillRow label="Jain Sect" values={pref?.pref_jain_sect} />
      <TagPillRow label="Manglik" values={pref?.pref_manglik} />
      <TagPillRow label="Mother Tongue" values={pref?.pref_mother_tongue} />

      <div className="my-2 border-t border-input" />

      {/* Professional */}
      <TagPillRow label="Education Level" values={pref?.pref_education_level} />
      <TagPillRow label="Qualifications" values={pref?.pref_educational_qualifications} />
      <TagPillRow label="Occupation" values={pref?.pref_occupation_category} />
      <TagPillRow label="Employment" values={pref?.pref_employment_status} />
      <TagPillRow label="Annual Income" values={pref?.pref_annual_income} />

      <div className="my-2 border-t border-input" />

      {/* Location */}
      <TagPillRow label="Working Country" values={pref?.pref_working_country} />
      <TagPillRow label="Working State" values={pref?.pref_working_state} />
      <TagPillRow label="Working District" values={pref?.pref_working_district} />
      <TagPillRow label="Residing Country" values={pref?.pref_residing_country} />
      <TagPillRow label="Native Country" values={pref?.pref_native_country} />
      <TagPillRow label="Native State" values={pref?.pref_native_state} />
      <TagPillRow label="Native District" values={pref?.pref_native_district} />
      <DetailRow label="Expectations" value={pref?.pref_expectations_detail} />
    </SectionViewCard>
  );
}
