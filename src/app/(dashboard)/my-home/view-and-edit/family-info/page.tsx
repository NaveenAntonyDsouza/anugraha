import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function FamilyInfoPage() {
  const profile = await getMyProfileData();
  const family = Array.isArray(profile.profile_family_info)
    ? profile.profile_family_info[0]
    : profile.profile_family_info;
  const sibling = Array.isArray(profile.profile_sibling_info)
    ? profile.profile_sibling_info[0]
    : profile.profile_sibling_info;

  return (
    <SectionViewCard title="Family Information" editHref="/my-home/view-and-edit/family-info-edit">
      <DetailRow label="Father's Name" value={family?.father_name} />
      <DetailRow label="Father's House Name" value={family?.father_house_name} />
      <DetailRow label="Father's Native Place" value={family?.father_native_place} />
      <DetailRow label="Father's Occupation" value={family?.father_occupation} />

      <div className="my-2 border-t border-input" />

      <DetailRow label="Mother's Name" value={family?.mother_name} />
      <DetailRow label="Mother's House Name" value={family?.mother_house_name} />
      <DetailRow label="Mother's Native Place" value={family?.mother_native_place} />
      <DetailRow label="Mother's Occupation" value={family?.mother_occupation} />

      <div className="my-2 border-t border-input" />

      <DetailRow label="Asset Details" value={family?.candidate_asset_details} />
      <DetailRow label="About Family" value={family?.about_candidate_family} />

      <div className="my-2 border-t border-input" />

      <DetailRow label="Brothers (Married)" value={sibling?.brothers_married} />
      <DetailRow label="Brothers (Unmarried)" value={sibling?.brothers_unmarried} />
      <DetailRow label="Brothers (Priest)" value={sibling?.brothers_priest} />
      <DetailRow label="Sisters (Married)" value={sibling?.sisters_married} />
      <DetailRow label="Sisters (Unmarried)" value={sibling?.sisters_unmarried} />
      <DetailRow label="Sisters (Nun)" value={sibling?.sisters_nun} />
    </SectionViewCard>
  );
}
