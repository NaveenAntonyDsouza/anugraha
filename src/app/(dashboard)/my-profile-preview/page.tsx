import { getMyProfileData } from "@/lib/profile-data";
import { createClient } from "@/lib/supabase/server";
import { ProfilePreviewClient } from "@/components/profile/profile-preview-client";

export default async function MyProfilePreviewPage() {
  const profile = await getMyProfileData();

  // Check premium status
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("user_memberships")
    .select("plan_name, expires_at")
    .eq("user_id", profile.user_id)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPremium = !!membership;

  return <ProfilePreviewClient profile={profile} isPremium={isPremium} />;
}
