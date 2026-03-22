import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  anugraha_id: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  age: number;
  primary_mobile_number: string;
  email_id: string;
  onboarding_completed: boolean;
  onboarding_step_completed: number;
  profile_completion_pct: number;
  created_by: string | null;
  creator_name: string | null;
  creator_contact_number: string | null;
  how_did_you_hear_about_us: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false }),
}));
