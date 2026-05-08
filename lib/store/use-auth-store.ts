import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  id: number;
  namaPengguna: string;
  namaLengkap: string;
  peran: string;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // nama key di localStorage
    },
  ),
);
