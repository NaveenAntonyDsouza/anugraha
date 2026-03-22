import { create } from "zustand";

interface OnboardingStore {
  currentStep: number;
  profileCompletion: number;
  setStep: (n: number) => void;
  setCompletion: (pct: number) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  profileCompletion: 40,
  setStep: (n) => set({ currentStep: n }),
  setCompletion: (pct) => set({ profileCompletion: pct }),
}));
