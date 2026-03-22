export const queryKeys = {
  // Auth & User
  user: ["user"] as const,
  profile: (id: string) => ["profile", id] as const,
  profileCompletion: (id: string) => ["profile-completion", id] as const,

  // Search & Discover
  searchResults: (filters: Record<string, unknown>) =>
    ["search-results", filters] as const,
  discoverCategories: ["discover-categories"] as const,
  savedSearches: ["saved-searches"] as const,

  // Matches & Views
  matches: ["matches"] as const,
  mutualMatches: ["mutual-matches"] as const,
  profileViews: (tab: string) => ["profile-views", tab] as const,

  // Interests & Messages
  interests: (tab: string) => ["interests", tab] as const,
  interestDetail: (id: string) => ["interest-detail", id] as const,
  photoRequests: ["photo-requests"] as const,

  // Notifications
  notifications: ["notifications"] as const,
  unreadCount: ["unread-count"] as const,

  // Lists
  shortlists: ["shortlists"] as const,
  blockedProfiles: ["blocked-profiles"] as const,
  ignoredProfiles: ["ignored-profiles"] as const,

  // Membership
  membershipPlans: ["membership-plans"] as const,
  currentMembership: ["current-membership"] as const,
} as const;
