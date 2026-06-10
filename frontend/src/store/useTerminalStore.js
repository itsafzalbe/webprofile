import { create } from "zustand"
import { persist } from "zustand/middleware"
import { HOME_PATH, SESSION_STORAGE_KEY } from "../utils/constants"
import { v4 as uuidv4 } from "uuid"

export const useTerminalStore = create(
  persist(
    (set, get) => ({
      currentPath:  HOME_PATH,
      history:      [],
      historyIndex: -1,
      output:       [],          // NOT persisted — see partialize below
      sessionId:    uuidv4(),
      usedCommands: [],          // plain array, NOT a Set — Sets break JSON serialization

      addOutput: (line) =>
        set((s) => ({
          output: [...s.output, { id: Date.now() + Math.random(), ...line }],
        })),

      clearOutput: () => set({ output: [] }),

      pushHistory: (cmd) =>
        set((s) => ({
          history:      [cmd, ...s.history].slice(0, 100),
          historyIndex: -1,
        })),

      setHistoryIndex: (i) => set({ historyIndex: i }),

      setPath: (path) => set({ currentPath: path }),

      // Track used commands as an array (serializable), deduplicated
      trackCommand: (cmd) =>
        set((s) => {
          if (s.usedCommands.includes(cmd)) return {}
          return { usedCommands: [...s.usedCommands, cmd] }
        }),

      resetSession: () => set({ sessionId: uuidv4() }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      // Only persist things that should survive a page refresh
      // output stays in memory only (avoids stale welcome messages)
      partialize: (s) => ({
        sessionId:    s.sessionId,
        history:      s.history,
        currentPath:  s.currentPath,
        usedCommands: s.usedCommands,
      }),
    }
  )
)
