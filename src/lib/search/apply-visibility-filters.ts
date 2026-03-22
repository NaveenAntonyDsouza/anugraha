// Search Visibility privacy filters
// Respects target profile's privacy settings
// Applied after fetching results + privacy_settings

import type { SearchProfileResult } from "./filter-types";

interface CurrentProfileContext {
  age: number;
  gender: string;
  height?: string | null;
  religion?: string | null;
  caste_community?: string | null;
}

function extractCm(heightStr: string | null | undefined): number {
  if (!heightStr) return 0;
  const match = heightStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function applyVisibilityFilters(
  profiles: SearchProfileResult[],
  currentProfile: CurrentProfileContext,
): SearchProfileResult[] {
  return profiles.filter((target) => {
    const ps = target.privacy_settings;
    if (!ps) return true;

    // Hide from search
    if (ps.hide_from_search) return false;

    // Age norm: Male target's show_outside_age_norm=false means
    // don't show to females who are older than him
    if (!ps.show_outside_age_norm) {
      if (target.gender === "Male" && currentProfile.age > target.age) return false;
      if (target.gender === "Female" && currentProfile.age < target.age) return false;
    }

    // Height norm
    if (!ps.show_outside_height_norm) {
      const targetHeight = extractCm(target.profile_primary_info?.height);
      const myHeight = extractCm(currentProfile.height);
      if (targetHeight && myHeight) {
        if (target.gender === "Male" && myHeight > targetHeight) return false;
        if (target.gender === "Female" && myHeight < targetHeight) return false;
      }
    }

    // Religion
    if (!ps.show_outside_religion) {
      const targetReligion = target.profile_religious_info?.religion;
      if (targetReligion && currentProfile.religion && targetReligion !== currentProfile.religion) {
        return false;
      }
    }

    // Caste
    if (!ps.show_outside_caste) {
      const targetCaste = target.profile_religious_info?.caste_community;
      if (targetCaste && currentProfile.caste_community && targetCaste !== currentProfile.caste_community) {
        return false;
      }
    }

    return true;
  });
}
