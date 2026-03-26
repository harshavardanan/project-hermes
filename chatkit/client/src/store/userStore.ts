import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DashboardUser {
  _id: string;
  displayName: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  plan?: {
    _id?: string;
    planId?: string;
    name?: string;
    dailyLimit?: number;
    monthlyPrice?: number;
    features?: string[];
  } | string | null;
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

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user: DashboardUser | null) => set({ user, isLoading: false }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      clearUser: () => set({ user: null, isLoading: false }),
    }),
    { name: "hermes-auth-storage" }
  )
);
