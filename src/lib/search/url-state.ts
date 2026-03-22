// URL <-> SearchFilters sync helpers
// All filters are serialized as query params for shareable deep links

import type { SearchFilters, ShowProfileToggles, SortOption } from "./filter-types";
import { DEFAULT_SHOW_PROFILE_TOGGLES } from "./filter-types";

const MULTI_VALUE_FIELDS = [
  "marital_status", "education_level", "occupation_category",
  "working_country", "working_state", "working_district",
  "native_country", "native_state", "native_district",
  "mother_tongue", "religion", "denomination", "diocese",
  "caste", "sub_caste", "muslim_sect", "muslim_community", "jain_sect",
  "physical_status", "category_differently_abled", "family_status",
  "body_type", "annual_income", "employment_status",
  "residing_country", "residential_status", "branch",
  "eating_habits", "drinking_habits", "smoking_habits",
  "children_status",
] as const;

const TOGGLE_FIELDS = [
  "filter_already_seen", "filter_already_contacted",
  "filter_interest_sent", "filter_shortlisted",
  "filter_with_photo", "filter_online", "filter_premium",
] as const;

export function filtersFromSearchParams(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};

  const minAge = searchParams.get("min_age");
  if (minAge) filters.min_age = Number(minAge);

  const maxAge = searchParams.get("max_age");
  if (maxAge) filters.max_age = Number(maxAge);

  const minHeight = searchParams.get("min_height");
  if (minHeight) filters.min_height = minHeight;

  const maxHeight = searchParams.get("max_height");
  if (maxHeight) filters.max_height = maxHeight;

  for (const field of MULTI_VALUE_FIELDS) {
    const values = searchParams.getAll(field);
    if (values.length > 0) {
      (filters as Record<string, string[]>)[field] = values;
    }
  }

  const keyword = searchParams.get("keyword");
  if (keyword) filters.keyword = keyword;

  const keywordType = searchParams.get("keyword_type");
  if (keywordType === "exact" || keywordType === "any") filters.keyword_type = keywordType;

  const sort = searchParams.get("sort") as SortOption | null;
  if (sort) filters.sort = sort;

  const page = searchParams.get("page");
  filters.page = page ? Number(page) : 1;

  const perPage = searchParams.get("per_page");
  if (perPage) filters.per_page = Number(perPage);

  const view = searchParams.get("view");
  if (view === "grid" || view === "list") filters.view = view;

  return filters;
}

export function togglesFromSearchParams(searchParams: URLSearchParams): ShowProfileToggles {
  const toggles = { ...DEFAULT_SHOW_PROFILE_TOGGLES };
  for (const field of TOGGLE_FIELDS) {
    const val = searchParams.get(field);
    if (val === "1" || val === "true") {
      toggles[field] = true;
    }
  }
  return toggles;
}

export function filtersToSearchParams(
  filters: SearchFilters,
  toggles?: ShowProfileToggles,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.min_age) params.set("min_age", String(filters.min_age));
  if (filters.max_age) params.set("max_age", String(filters.max_age));
  if (filters.min_height) params.set("min_height", filters.min_height);
  if (filters.max_height) params.set("max_height", filters.max_height);

  for (const field of MULTI_VALUE_FIELDS) {
    const values = (filters as Record<string, string[] | undefined>)[field];
    if (values?.length) {
      for (const v of values) {
        params.append(field, v);
      }
    }
  }

  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.keyword_type) params.set("keyword_type", filters.keyword_type);
  if (filters.sort && filters.sort !== "last_active") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.per_page && filters.per_page !== 20) params.set("per_page", String(filters.per_page));
  if (filters.view && filters.view !== "grid") params.set("view", filters.view);

  if (toggles) {
    for (const field of TOGGLE_FIELDS) {
      if (toggles[field]) params.set(field, "1");
    }
  }

  return params;
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    filters.min_age || filters.max_age ||
    filters.min_height || filters.max_height ||
    filters.marital_status?.length ||
    filters.education_level?.length ||
    filters.occupation_category?.length ||
    filters.working_country?.length ||
    filters.native_country?.length ||
    filters.mother_tongue?.length ||
    filters.religion?.length ||
    filters.denomination?.length ||
    filters.diocese?.length ||
    filters.caste?.length ||
    filters.keyword
  );
}
