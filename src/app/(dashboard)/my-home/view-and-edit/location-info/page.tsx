import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function LocationInfoPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_location_info)
    ? profile.profile_location_info[0]
    : profile.profile_location_info;

  return (
    <SectionViewCard title="Location Information" editHref="/my-home/view-and-edit/location-info-edit">
      <DetailRow label="Native Country" value={info?.native_country} />
      <DetailRow label="Native State" value={info?.native_state} />
      <DetailRow label="Native District" value={info?.native_district} />

      <div className="my-2 border-t border-input" />

      <DetailRow label="Residing Country" value={info?.residing_country} />
      {info?.residing_country && info.residing_country !== "India" && (
        <DetailRow label="Residential Status" value={info?.residential_status} />
      )}
      {info?.residing_country && info.residing_country !== "India" && (
        <>
          <DetailRow
            label="Outstation Leave From"
            value={info?.outstation_leave_date_from}
          />
          <DetailRow
            label="Outstation Leave To"
            value={info?.outstation_leave_date_to}
          />
        </>
      )}
      <DetailRow label="Preferred Branch" value={info?.preferred_branch} />
    </SectionViewCard>
  );
}
