import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function SocialMediaPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_social_media)
    ? profile.profile_social_media[0]
    : profile.profile_social_media;

  return (
    <SectionViewCard title="Social Media Information" editHref="/my-home/view-and-edit/social-media-edit">
      <DetailRow label="Facebook" value={info?.facebook} />
      <DetailRow label="Instagram" value={info?.instagram} />
      <DetailRow label="LinkedIn" value={info?.linkedin} />
      <DetailRow label="YouTube" value={info?.youtube} />
      <DetailRow label="Website" value={info?.website} />
    </SectionViewCard>
  );
}
