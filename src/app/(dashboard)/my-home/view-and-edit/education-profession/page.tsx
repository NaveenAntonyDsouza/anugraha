import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function EducationProfessionPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_education_profession)
    ? profile.profile_education_profession[0]
    : profile.profile_education_profession;

  return (
    <SectionViewCard title="Education & Profession" editHref="/my-home/view-and-edit/education-profession-edit">
      <DetailRow label="Educational Qualifications" value={info?.educational_qualifications} />
      <DetailRow label="Education Level" value={info?.education_level} />
      <DetailRow label="Education Details" value={info?.education_in_detail} />
      <DetailRow label="Occupation Category" value={info?.occupation_category} />
      <DetailRow label="Employment Category" value={info?.employment_category} />
      <DetailRow label="Occupation Details" value={info?.occupation_in_detail} />
      <DetailRow label="Organization Name" value={info?.organization_name} />
      <DetailRow label="Working Country" value={info?.working_country} />
      <DetailRow label="Working State" value={info?.working_state} />
      <DetailRow label="Working District" value={info?.working_district} />
      <DetailRow label="Annual Income" value={info?.annual_income} />
    </SectionViewCard>
  );
}
