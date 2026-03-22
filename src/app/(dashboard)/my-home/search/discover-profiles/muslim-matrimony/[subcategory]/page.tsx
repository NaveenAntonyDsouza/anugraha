"use client";

import { useParams } from "next/navigation";
import { CategoryResultsPage } from "@/components/discover/category-results-page";
import { createClient } from "@/lib/supabase/client";
import { fromSlug } from "@/lib/search/slug-utils";

const SELECT = `id, anugraha_id, full_name, gender, age, user_id, updated_at,
  profile_primary_info(height, complexion, marital_status, mother_tongue),
  profile_religious_info(religion, denomination, diocese, caste_community),
  profile_education_profession(education_level, occupation_category, working_country, working_state, working_district),
  profile_photos(photo_url, is_primary)`;

const SECTS = ["Sunni", "Shia"];

export default function MuslimSubcategoryResultsPage() {
  const params = useParams();
  const slug = params.subcategory as string;
  const name = fromSlug(slug);

  const isSect = SECTS.includes(name);

  function queryFn(
    supabase: ReturnType<typeof createClient>,
    profileId: string,
    gender: string,
    from: number,
    to: number
  ) {
    let query = supabase
      .from("profiles")
      .select(SELECT, { count: "exact" })
      .eq("is_active", true)
      .is("deleted_at", null)
      .neq("id", profileId)
      .eq("gender", gender)
      .eq("profile_religious_info.religion", "Muslim");

    if (isSect) {
      query = query.eq("profile_religious_info.muslim_sect", name);
    } else {
      query = query.eq("profile_religious_info.muslim_community", name);
    }

    return query
      .order("updated_at", { ascending: false })
      .range(from, to);
  }

  return (
    <CategoryResultsPage
      title={name + " Brides"}
      breadcrumbs={[
        { label: "My Home", href: "/my-home" },
        { label: "Discover Profiles", href: "/my-home/search/discover-profiles" },
        { label: "Muslim Matrimony", href: "/my-home/search/discover-profiles/muslim-matrimony" },
        { label: name + " Brides", href: "#" },
      ]}
      queryFn={queryFn}
      categoryHref="/my-home/search/discover-profiles/muslim-matrimony"
    />
  );
}
