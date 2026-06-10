import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultTheme } from "../themes/themes"
import { THEME_STORAGE_KEY } from "../utils/constants"

export const useThemeStore = create(
  persist(
    (set) => ({
      terminalTheme: defaultTheme,
      guiTheme: "dark",

      setTerminalTheme: (name) => set({ terminalTheme: name }),
      toggleGuiTheme:   ()     => set((s) => ({
        guiTheme: s.guiTheme === "dark" ? "light" : "dark",
      })),
    }),
    { name: THEME_STORAGE_KEY }
  )
)