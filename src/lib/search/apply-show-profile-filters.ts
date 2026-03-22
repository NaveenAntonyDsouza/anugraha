// Client-side "Show Profile" toggle filters
// Applied after fetching results from the database

import type { SearchProfileResult, ShowProfileToggles, UserInteractionData } from "./filter-types";

export function applyShowProfileFilters(
  profiles: SearchProfileResult[],
  toggles: ShowProfileToggles,
  userData: UserInteractionData,
): SearchProfileResult[] {
  return profiles.filter((p) => {
    if (toggles.filter_already_seen && userData.viewedIds.includes(p.id)) return false;
    if (toggles.filter_already_contacted && userData.contactedIds.includes(p.id)) return false;
    if (toggles.filter_interest_sent && userData.sentInterestIds.includes(p.id)) return false;
    if (toggles.filter_shortlisted && userData.shortlistedIds.includes(p.id)) return false;
    if (toggles.filter_with_photo && !p.profile_photos?.some((ph) => ph.is_primary)) return false;
    if (toggles.filter_premium && !p.is_premium) return false;
    // filter_online: would need last_login_at check — skipped for now (requires users table join)
    return true;
  });
}
