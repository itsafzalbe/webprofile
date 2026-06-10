import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAdminStore = create(
  persist(
    (set, get) => ({
      token:    null,
      user:     null,
      isAdmin:  false,

      setAuth: (token, user) => {
        localStorage.setItem("afzalbe_os_token", token)
        set({ token, user, isAdmin: true })
      },

      clearAuth: () => {
        localStorage.removeItem("afzalbe_os_token")
        set({ token: null, user: null, isAdmin: false })
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "afzalbe_os_admin",
      partialize: (s) => ({ token: s.token, user: s.user, isAdmin: s.isAdmin }),
    }
  )
)