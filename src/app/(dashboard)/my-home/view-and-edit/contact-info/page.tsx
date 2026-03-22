import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";

export default async function ContactInfoPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_contact_info)
    ? profile.profile_contact_info[0]
    : profile.profile_contact_info;

  return (
    <SectionViewCard title="Contact Information" editHref="/my-home/view-and-edit/contact-info-edit">
      <DetailRow label="Mobile Number" value={info?.mobile_number} />
      <DetailRow label="WhatsApp Number" value={info?.whatsapp_number} />
      <DetailRow label="Custodian Name" value={info?.custodian_name} />
      <DetailRow label="Custodian Relation" value={info?.custodian_relation} />
      <DetailRow label="Communication Address" value={info?.communication_address} />
      <DetailRow label="PIN / ZIP Code" value={info?.pin_zip_code} />

      <div className="my-2 border-t border-input" />

      <DetailRow label="Residential Phone" value={info?.residential_phone_number} />
      <DetailRow label="Secondary Mobile" value={info?.secondary_mobile_number} />
      <DetailRow label="Preferred Call Time" value={info?.preferred_call_time} />
      <DetailRow label="Alternate Email" value={info?.alternate_email_id} />
      <DetailRow label="Reference Name" value={info?.reference_name} />
      <DetailRow label="Reference Relation" value={info?.reference_relationship} />
      <DetailRow label="Reference Mobile" value={info?.reference_mobile} />

      <div className="my-2 border-t border-input" />

      <DetailRow
        label="Present Address"
        value={
          info?.present_address_same_as_comm
            ? "Same as communication address"
            : info?.present_address
        }
      />
      {!info?.present_address_same_as_comm && (
        <DetailRow label="Present PIN / ZIP" value={info?.present_pin_zip_code} />
      )}

      <DetailRow
        label="Permanent Address"
        value={
          info?.permanent_address_same_as_comm
            ? "Same as communication address"
            : info?.permanent_address_same_as_present
              ? "Same as present address"
              : info?.permanent_address
        }
      />
      {!info?.permanent_address_same_as_comm &&
        !info?.permanent_address_same_as_present && (
          <DetailRow label="Permanent PIN / ZIP" value={info?.permanent_pin_zip_code} />
        )}
    </SectionViewCard>
  );
}
