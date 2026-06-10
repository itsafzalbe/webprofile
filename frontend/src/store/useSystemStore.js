import { create } from "zustand"
import { BOOT_STORAGE_KEY } from "../utils/constants"

export const useSystemStore = create((set) => ({
  mode:         "terminal",   // "terminal" | "gui"
  bootComplete: sessionStorage.getItem(BOOT_STORAGE_KEY) === "true",

  setMode: (mode) => set({ mode }),

  setBootComplete: () => {
    sessionStorage.setItem(BOOT_STORAGE_KEY, "true")
    set({ bootComplete: true })
  },

  switchToGUI:      () => set({ mode: "gui" }),
  switchToTerminal: () => set({ mode: "terminal" }),
}))