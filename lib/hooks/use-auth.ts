import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, AuthResponse } from "@/lib/types/auth"
import { logout as logoutService } from "@/lib/services/auth"

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (response: AuthResponse) => {
        // Set HTTP only cookie for JWT
        document.cookie = `auth-token=${response.access_token}; path=/; secure; samesite=strict`
        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
        })
      },
      logout: async () => {
        try {
          await logoutService()
        } finally {
          // Remove JWT cookie
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

