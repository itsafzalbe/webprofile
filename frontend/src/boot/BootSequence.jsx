import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeStore } from "../store/useThemeStore"
import { useSystemStore } from "../store/useSystemStore"
import { themes } from "../themes/themes"
import { bootLines } from "./bootLines"

export default function BootSequence() {
  const [visibleLines, setVisibleLines] = useState([])
  const [done, setDone]                 = useState(false)
  const { terminalTheme }               = useThemeStore()
  const { setBootComplete }             = useSystemStore()
  const theme                           = themes[terminalTheme]

  useEffect(() => {
    const timers = []

    bootLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line])

        // After last line
        if (i === bootLines.length - 1) {
          setTimeout(() => {
            setDone(true)
            setTimeout(() => setBootComplete(), 600)
          }, 600)
        }
      }, line.delay)

      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  const getColor = (colorKey) => {
    if (!colorKey) return theme.text
    return theme[colorKey] || theme.text
  }

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#000000" }}
        >
          <div
            className="w-full max-w-2xl px-8 py-6 font-mono text-sm"
            style={{ color: theme.text }}
          >
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="leading-relaxed"
                style={{
                  color:      getColor(line.color),
                  minHeight:  "1.4rem",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize:   "13px",
                }}
              >
                {line.text}
              </motion.div>
            ))}

            {/* Blinking cursor at the end */}
            {visibleLines.length > 0 && !done && (
              <span
                className="inline-block w-2 h-4 ml-1 animate-blink"
                style={{ backgroundColor: theme.cursor }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}