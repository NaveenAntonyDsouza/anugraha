import { create } from "zustand";
import type { SearchFilters, ShowProfileToggles, UserInteractionData } from "@/lib/search/filter-types";
import { DEFAULT_SHOW_PROFILE_TOGGLES } from "@/lib/search/filter-types";

interface SearchStore {
  // Filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;

  // Show Profile toggles (client-side)
  toggles: ShowProfileToggles;
  setToggles: (toggles: ShowProfileToggles) => void;
  updateToggle: (key: keyof ShowProfileToggles, value: boolean) => void;

  // User interaction data (cached once per page load)
  interactionData: UserInteractionData;
  setInteractionData: (data: UserInteractionData) => void;

  // Results meta
  totalCount: number;
  setTotalCount: (count: number) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  sort: "last_active",
  page: 1,
  per_page: 20,
  view: "grid",
};

export const useSearchStore = create<SearchStore>((set) => ({
  filters: { ...DEFAULT_FILTERS },
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  toggles: { ...DEFAULT_SHOW_PROFILE_TOGGLES },
  setToggles: (toggles) => set({ toggles }),
  updateToggle: (key, value) =>
    set((s) => ({ toggles: { ...s.toggles, [key]: value } })),

  interactionData: {
    viewedIds: [],
    contactedIds: [],
    sentInterestIds: [],
    shortlistedIds: [],
  },
  setInteractionData: (data) => set({ interactionData: data }),

  totalCount: 0,
  setTotalCount: (count) => set({ totalCount: count }),
}));
