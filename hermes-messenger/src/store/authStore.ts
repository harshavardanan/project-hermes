import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setTestUser: (name: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user, loading: false }),
  setTestUser: (name) => set({ 
    user: { 
      uid: `test-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`, 
      displayName: name,
    }, 
    loading: false 
  }),
  login: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        set({ 
          user: {
            uid: result.user.uid,
            displayName: result.user.displayName || 'Anonymous',
            photoURL: result.user.photoURL || undefined,
            email: result.user.email || undefined
          },
          loading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ user: null, loading: false });
    }
  },
  init: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ 
          user: {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || undefined,
            email: user.email || undefined
          },
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    });
  },
}));
