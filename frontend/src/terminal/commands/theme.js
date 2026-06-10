import { useThemeStore } from "../../store/useThemeStore"
import { themes } from "../../themes/themes"

export default async function theme({ parsed, addOutput }) {
  const { terminalTheme, setTerminalTheme } = useThemeStore.getState()
  const name = parsed.positional[0]

  if (!name) {
    addOutput({ type: "accent", text: "── Reality Filters ───────────────────────" })
    addOutput({ type: "empty" })

    Object.entries(themes).forEach(([key, t]) => {
      const active = key === terminalTheme ? " ← active" : ""
      addOutput({
        type: "text",
        html: `  <span style="color:${t.user}">${key.padEnd(20)}</span><span style="color:${t.muted}">${t.name}${active}</span>`,
      })
    })

    addOutput({ type: "empty" })
    addOutput({ type: "muted", text: "  Usage: theme <name>" })
    addOutput({ type: "empty" })
    return
  }

  if (!themes[name]) {
    addOutput({ type: "error", text: `unknown theme detected • run 'theme'` })
    return
  }

  setTerminalTheme(name)
  addOutput({ type: "success", text: `  Reality shifted → '${themes[name].name}'.` })
  addOutput({ type: "empty" })
}
