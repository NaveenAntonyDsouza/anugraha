import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function ReligiousInfoPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_religious_info)
    ? profile.profile_religious_info[0]
    : profile.profile_religious_info;

  return (
    <SectionViewCard title="Religious Information" editHref="/my-home/view-and-edit/religious-info-edit">
      <DetailRow label="Religion" value={info?.religion} />
      {info?.religion === "Other" && (
        <DetailRow label="Other Religion" value={info?.other_religion_name} />
      )}

      {/* Christian fields */}
      {info?.religion === "Christian" && (
        <>
          <DetailRow label="Denomination" value={info?.denomination} />
          <DetailRow label="Diocese" value={info?.diocese} />
          {info?.diocese === "Other" && (
            <DetailRow label="Diocese Name" value={info?.diocese_name} />
          )}
          <DetailRow label="Parish / Place" value={info?.parish_name_place} />
        </>
      )}

      {/* Hindu / Jain fields */}
      {(info?.religion === "Hindu" || info?.religion === "Jain") && (
        <>
          <DetailRow label="Caste / Community" value={info?.caste_community} />
          <DetailRow label="Sub-Caste" value={info?.sub_caste_community} />
          <DetailRow label="Time of Birth" value={info?.time_of_birth} />
          <DetailRow label="Place of Birth" value={info?.place_of_birth} />
          <DetailRow label="Rasi" value={info?.rasi} />
          <DetailRow label="Nakshatra" value={info?.nakshatra} />
          <DetailRow label="Gothram" value={info?.gothram} />
        </>
      )}

      {info?.religion === "Hindu" && (
        <DetailRow label="Manglik" value={info?.manglik} />
      )}

      {info?.religion === "Jain" && (
        <DetailRow label="Jain Sect" value={info?.jain_sect} />
      )}

      {/* Muslim fields */}
      {info?.religion === "Muslim" && (
        <>
          <DetailRow label="Muslim Sect" value={info?.muslim_sect} />
          <DetailRow label="Community / Jamath" value={info?.muslim_community} />
          <DetailRow label="Religious Observance" value={info?.religious_observance} />
        </>
      )}
    </SectionViewCard>
  );
}
