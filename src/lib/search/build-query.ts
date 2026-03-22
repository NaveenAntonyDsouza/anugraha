// Search query builder — constructs Supabase query from SearchFilters
// IMPORTANT: privacy_settings and user_memberships use user_id FK,
// so they're queried separately after the main fetch.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchFilters } from "./filter-types";

const SEARCH_SELECT = `
  id, anugraha_id, full_name, gender, age, user_id, updated_at,
  profile_primary_info(height, complexion, body_type, marital_status, family_status, mother_tongue),
  profile_religious_info(religion, denomination, diocese, caste_community),
  profile_education_profession(occupation_category, annual_income, education_level, employment_category,
                               working_country, working_state, working_district),
  profile_location_info(native_country, native_state, native_district,
                        residing_country, residential_status),
  profile_lifestyle_hobbies(eating_habits, drinking_habits, smoking_habits),
  profile_photos!inner(photo_url, is_primary)
`.trim();

// Use left join for photos so profiles without photos still appear
const SEARCH_SELECT_LEFT_JOIN = SEARCH_SELECT.replace(
  "profile_photos!inner(photo_url, is_primary)",
  "profile_photos(photo_url, is_primary)"
);

export function buildSearchQuery(
  supabase: SupabaseClient,
  filters: SearchFilters,
  currentProfileId: string,
  currentGender: string,
) {
  const oppositeGender = currentGender === "Male" ? "Female" : "Male";

  let query = supabase
    .from("profiles")
    .select(SEARCH_SELECT_LEFT_JOIN, { count: "exact" })
    .eq("is_active", true)
    .eq("is_approved", true)
    .is("deleted_at", null)
    .neq("id", currentProfileId)
    .eq("gender", oppositeGender);

  // Age
  if (filters.min_age) query = query.gte("age", filters.min_age);
  if (filters.max_age) query = query.lte("age", filters.max_age);

  // Height (stored as string like "165 cm - 5 ft 05 inch", compare by leading cm number)
  // PostgREST can't do numeric substring comparison, so height filtering is best done client-side
  // For now, we skip server-side height filtering — it's applied in post-processing

  // Marital status
  if (filters.marital_status?.length)
    query = query.in("profile_primary_info.marital_status", filters.marital_status);

  // Education
  if (filters.education_level?.length)
    query = query.in("profile_education_profession.education_level", filters.education_level);

  // Occupation
  if (filters.occupation_category?.length)
    query = query.in("profile_education_profession.occupation_category", filters.occupation_category);

  // Working location
  if (filters.working_country?.length)
    query = query.in("profile_education_profession.working_country", filters.working_country);
  if (filters.working_state?.length)
    query = query.in("profile_education_profession.working_state", filters.working_state);
  if (filters.working_district?.length)
    query = query.in("profile_education_profession.working_district", filters.working_district);

  // Native location
  if (filters.native_country?.length)
    query = query.in("profile_location_info.native_country", filters.native_country);
  if (filters.native_state?.length)
    query = query.in("profile_location_info.native_state", filters.native_state);
  if (filters.native_district?.length)
    query = query.in("profile_location_info.native_district", filters.native_district);

  // Mother tongue
  if (filters.mother_tongue?.length)
    query = query.in("profile_primary_info.mother_tongue", filters.mother_tongue);

  // Religion + conditional children
  if (filters.religion?.length && !filters.religion.includes("Any"))
    query = query.in("profile_religious_info.religion", filters.religion);

  if (filters.denomination?.length)
    query = query.in("profile_religious_info.denomination", filters.denomination);
  if (filters.diocese?.length)
    query = query.in("profile_religious_info.diocese", filters.diocese);
  if (filters.caste?.length)
    query = query.in("profile_religious_info.caste_community", filters.caste);
  if (filters.sub_caste?.length)
    query = query.in("profile_religious_info.sub_caste_community", filters.sub_caste);
  if (filters.muslim_sect?.length)
    query = query.in("profile_religious_info.muslim_sect", filters.muslim_sect);
  if (filters.muslim_community?.length)
    query = query.in("profile_religious_info.muslim_community", filters.muslim_community);
  if (filters.jain_sect?.length)
    query = query.in("profile_religious_info.jain_sect", filters.jain_sect);

  // Add More Criteria
  if (filters.physical_status?.length)
    query = query.in("profile_primary_info.physical_status", filters.physical_status);
  if (filters.body_type?.length)
    query = query.in("profile_primary_info.body_type", filters.body_type);
  if (filters.family_status?.length)
    query = query.in("profile_primary_info.family_status", filters.family_status);
  if (filters.annual_income?.length)
    query = query.in("profile_education_profession.annual_income", filters.annual_income);
  if (filters.employment_status?.length)
    query = query.in("profile_education_profession.employment_category", filters.employment_status);
  if (filters.residing_country?.length)
    query = query.in("profile_location_info.residing_country", filters.residing_country);
  if (filters.residential_status?.length)
    query = query.in("profile_location_info.residential_status", filters.residential_status);

  // Lifestyle
  if (filters.eating_habits?.length)
    query = query.in("profile_lifestyle_hobbies.eating_habits", filters.eating_habits);
  if (filters.drinking_habits?.length)
    query = query.in("profile_lifestyle_hobbies.drinking_habits", filters.drinking_habits);
  if (filters.smoking_habits?.length)
    query = query.in("profile_lifestyle_hobbies.smoking_habits", filters.smoking_habits);

  // Sort
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    last_active: { column: "updated_at", ascending: false },
    newest: { column: "created_at", ascending: false },
    relevance: { column: "created_at", ascending: false },
  };
  const sort = sortMap[filters.sort ?? "last_active"];
  query = query.order(sort.column, { ascending: sort.ascending });

  // Pagination
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  query = query.range((page - 1) * perPage, page * perPage - 1);

  return query;
}

export function buildKeywordQuery(
  supabase: SupabaseClient,
  keyword: string,
  keywordType: "exact" | "any",
  filters: SearchFilters,
  currentProfileId: string,
  currentGender: string,
) {
  const oppositeGender = currentGender === "Male" ? "Female" : "Male";

  let query = supabase
    .from("profiles")
    .select(SEARCH_SELECT_LEFT_JOIN, { count: "exact" })
    .eq("is_active", true)
    .eq("is_approved", true)
    .is("deleted_at", null)
    .neq("id", currentProfileId)
    .eq("gender", oppositeGender);

  // Keyword: search in full_name and anugraha_id
  if (keywordType === "exact") {
    query = query.or(`full_name.ilike.%${keyword}%,anugraha_id.ilike.%${keyword}%`);
  } else {
    // Any word: split by space and search each
    const words = keyword.split(/\s+/).filter(Boolean);
    const conditions = words.map(w =>
      `full_name.ilike.%${w}%,anugraha_id.ilike.%${w}%`
    ).join(",");
    query = query.or(conditions);
  }

  // Apply same filters as partner search (subset)
  if (filters.min_age) query = query.gte("age", filters.min_age);
  if (filters.max_age) query = query.lte("age", filters.max_age);
  if (filters.denomination?.length)
    query = query.in("profile_religious_info.denomination", filters.denomination);
  if (filters.marital_status?.length)
    query = query.in("profile_primary_info.marital_status", filters.marital_status);
  if (filters.education_level?.length)
    query = query.in("profile_education_profession.education_level", filters.education_level);
  if (filters.occupation_category?.length)
    query = query.in("profile_education_profession.occupation_category", filters.occupation_category);
  if (filters.working_country?.length)
    query = query.in("profile_education_profession.working_country", filters.working_country);
  if (filters.working_state?.length)
    query = query.in("profile_education_profession.working_state", filters.working_state);
  if (filters.working_district?.length)
    query = query.in("profile_education_profession.working_district", filters.working_district);
  if (filters.native_country?.length)
    query = query.in("profile_location_info.native_country", filters.native_country);
  if (filters.native_state?.length)
    query = query.in("profile_location_info.native_state", filters.native_state);
  if (filters.native_district?.length)
    query = query.in("profile_location_info.native_district", filters.native_district);

  // Sort & paginate
  const page = filters.page ?? 1;
  const perPage = filters.per_page ?? 20;
  query = query.order("updated_at", { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  return query;
}
