import { create } from "zustand";

interface NotificationStore {
  unreadCount: number;
  increment: () => void;
  reset: () => void;
  setCount: (n: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  reset: () => set({ unreadCount: 0 }),
  setCount: (n) => set({ unreadCount: n }),
}));
