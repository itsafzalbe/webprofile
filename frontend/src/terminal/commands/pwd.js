import { useTerminalStore } from "../../store/useTerminalStore"

export default async function pwd({ addOutput, theme }) {
  const { currentPath } = useTerminalStore.getState()
  addOutput({ type: "text", text: currentPath })
  addOutput({ type: "empty" })
}