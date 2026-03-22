import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getMyProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `*, profile_primary_info(*), profile_religious_info(*),
       profile_education_profession(*), profile_family_info(*), profile_sibling_info(*),
       profile_location_info(*), profile_contact_info(*), profile_lifestyle_hobbies(*),
       profile_social_media(*), partner_preferences(*), profile_photos(*),
       photo_privacy_settings(*), id_proofs(*)`
    )
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/register-free");

  return profile;
}
