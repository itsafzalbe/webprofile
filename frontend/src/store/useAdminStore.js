import { create } from "zustand"
import { persist } from "zustand/middleware"
import { TOKEN_KEY } from "../utils/constants"

export const useAdminStore = create(
  persist(
    (set, get) => ({
      token:   null,
      user:    null,
      isAdmin: false,

      setAuth: (token, user) => {
        localStorage.setItem(TOKEN_KEY, token)
        set({ token, user, isAdmin: true })
      },

      clearAuth: () => {
        localStorage.removeItem(TOKEN_KEY)
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