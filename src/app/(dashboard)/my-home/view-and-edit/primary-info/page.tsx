import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";
import { TagPillRow } from "@/components/profile/tag-pill";

export default async function PrimaryInfoPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_primary_info)
    ? profile.profile_primary_info[0]
    : profile.profile_primary_info;

  return (
    <SectionViewCard title="Primary Information" editHref="/my-home/view-and-edit/primary-info-edit">
      <DetailRow label="Height" value={info?.height} />
      <DetailRow label="Weight" value={info?.weight} />
      <DetailRow label="Complexion" value={info?.complexion} />
      <DetailRow label="Body Type" value={info?.body_type} />
      <DetailRow label="Physical Status" value={info?.physical_status} />
      {info?.physical_status === "Differently Abled" && (
        <>
          <TagPillRow label="Category" values={info?.category_differently_abled} />
          <DetailRow label="Specify" value={info?.specify_differently_abled} />
          <DetailRow label="Description" value={info?.describe_differently_abled} />
        </>
      )}
      <DetailRow label="Marital Status" value={info?.marital_status} />
      {info?.marital_status && info.marital_status !== "Unmarried" && (
        <>
          <DetailRow label="Children With Me" value={info?.children_with_me} />
          <DetailRow label="Children Not With Me" value={info?.children_not_with_me} />
        </>
      )}
      <DetailRow label="Family Status" value={info?.family_status} />
      <DetailRow label="Blood Group" value={info?.blood_group} />
      <DetailRow label="Mother Tongue" value={info?.mother_tongue} />
      <DetailRow label="About the Candidate" value={info?.about_the_candidate} />
    </SectionViewCard>
  );
}
