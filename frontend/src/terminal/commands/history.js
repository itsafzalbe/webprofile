import { useTerminalStore } from "../../store/useTerminalStore"

export default async function history({ addOutput }) {
  const { history } = useTerminalStore.getState()

  if (history.length === 0) {
    addOutput({
      type: "muted",
      text: "bro has no lore yet [x_x]"
    })
    return
  }
  addOutput({
    type: "accent",
    text: "── What Just Happened ────────────────────"
  })
  addOutput({ type: "empty" })
  history.slice().reverse().forEach((cmd, i) => {
    addOutput({
      type: "muted",
      text: `  ${String(i + 1).padStart(3)}  ${cmd}`
    })
  })
  addOutput({ type: "empty" })
  addOutput({
    type: "muted",
    text: `  ${history.length} crime${history.length !== 1 ? "s" : ""} committed [>_<]`
  })
}