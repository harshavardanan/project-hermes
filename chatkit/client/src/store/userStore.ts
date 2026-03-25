import { create } from "zustand";

export interface DashboardUser {
  _id: string;
  displayName: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  plan?: string | null;
  dailyTokensUsed: number;
  dailyTokensReset: Date;
}

interface UserStore {
  user: DashboardUser | null;
  isLoading: boolean;
  setUser: (user: DashboardUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, isLoading: false }),
}));
