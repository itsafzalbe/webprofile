import { useAchievementStore } from "../store/useAchievementStore"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeStore } from "../store/useThemeStore"
import { themes } from "../themes/themes"

export default function AchievementToast() {
  const { queue, dismissToast } = useAchievementStore()
  const { terminalTheme }       = useThemeStore()
  const theme                   = themes[terminalTheme]
  const current = queue?.[0]

  useEffect(() => {
    if (!current) return
    const t = setTimeout(dismissToast, 4000)
    return () => clearTimeout(t)
  }, [current])

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg px-4 py-3 shadow-xl min-w-64"
            style={{
              backgroundColor: theme.surface,
              border:          `1px solid ${theme.border}`,
              fontFamily:      "JetBrains Mono, monospace",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{current.icon}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: theme.accent }}>
                  Achievement Unlocked
                </div>
                <div className="text-sm font-medium" style={{ color: theme.text }}>
                  {current.title}
                </div>
                <div className="text-xs" style={{ color: theme.muted }}>
                  {current.description} · +{current.xp} XP
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}