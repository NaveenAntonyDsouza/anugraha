// Search filter type definitions for Slice 5

export interface SearchFilters {
  // Primary fields
  min_age?: number;
  max_age?: number;
  min_height?: string;
  max_height?: string;
  marital_status?: string[];
  education_level?: string[];
  occupation_category?: string[];
  working_country?: string[];
  working_state?: string[];
  working_district?: string[];
  native_country?: string[];
  native_state?: string[];
  native_district?: string[];
  mother_tongue?: string[];
  religion?: string[];

  // Religion conditional children
  denomination?: string[];
  diocese?: string[];
  caste?: string[];
  sub_caste?: string[];
  muslim_sect?: string[];
  muslim_community?: string[];
  jain_sect?: string[];

  // Add More Criteria
  physical_status?: string[];
  category_differently_abled?: string[];
  family_status?: string[];
  body_type?: string[];
  annual_income?: string[];
  employment_status?: string[];
  residing_country?: string[];
  residential_status?: string[];

  // Branch
  branch?: string[];

  // Lifestyle
  eating_habits?: string[];
  drinking_habits?: string[];
  smoking_habits?: string[];

  // Keyword search
  keyword?: string;
  keyword_type?: "exact" | "any";

  // Children status (keyword search only)
  children_status?: string[];

  // Meta
  sort?: SortOption;
  page?: number;
  per_page?: number;
  view?: "grid" | "list";
}

export type SortOption = "last_active" | "newest" | "relevance";

export interface ShowProfileToggles {
  filter_already_seen: boolean;
  filter_already_contacted: boolean;
  filter_interest_sent: boolean;
  filter_shortlisted: boolean;
  filter_with_photo: boolean;
  filter_online: boolean;
  filter_premium: boolean;
}

export const DEFAULT_SHOW_PROFILE_TOGGLES: ShowProfileToggles = {
  filter_already_seen: false,
  filter_already_contacted: false,
  filter_interest_sent: false,
  filter_shortlisted: false,
  filter_with_photo: false,
  filter_online: false,
  filter_premium: false,
};

export interface SearchProfileResult {
  id: string;
  anugraha_id: string;
  full_name: string;
  gender: string;
  age: number;
  user_id: string;
  updated_at: string;
  profile_primary_info: {
    height: string | null;
    complexion: string | null;
    body_type: string | null;
    marital_status: string | null;
    family_status: string | null;
    mother_tongue: string | null;
  } | null;
  profile_religious_info: {
    religion: string | null;
    denomination: string | null;
    diocese: string | null;
    caste_community: string | null;
  } | null;
  profile_education_profession: {
    occupation_category: string | null;
    annual_income: string | null;
    education_level: string | null;
    employment_category: string | null;
    working_country: string | null;
    working_state: string | null;
    working_district: string | null;
  } | null;
  profile_location_info: {
    native_country: string | null;
    native_state: string | null;
    native_district: string | null;
    residing_country: string | null;
    residential_status: string | null;
  } | null;
  profile_lifestyle_hobbies: {
    eating_habits: string | null;
    drinking_habits: string | null;
    smoking_habits: string | null;
  } | null;
  profile_photos: {
    photo_url: string;
    is_primary: boolean;
  }[] | null;
  // Attached after separate queries
  privacy_settings?: {
    show_outside_age_norm: boolean;
    show_outside_height_norm: boolean;
    show_outside_religion: boolean;
    show_outside_caste: boolean;
    hide_from_search: boolean;
  } | null;
  is_premium?: boolean;
  last_login_at?: string | null;
}

export interface UserInteractionData {
  viewedIds: string[];
  contactedIds: string[];
  sentInterestIds: string[];
  shortlistedIds: string[];
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  result_count: number | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}
