import { create } from "zustand"

// Achievements (certifications/awards) are portfolio data — fetched via GET /achievements.
// The terminal badge/unlock system has been removed.
// unlock() is kept as a no-op so existing command files don't crash.

export const useAchievementStore = create(() => ({
  unlock: async () => {},   // no-op — no badge system
}))
