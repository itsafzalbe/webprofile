import { ls as lsAPI } from "../../api/filesystem"
import { useTerminalStore } from "../../store/useTerminalStore"
import { formatFileSize } from "../../utils/formatters"

export default async function ls({ parsed, addOutput, theme }) {
  const { currentPath } = useTerminalStore.getState()
  const path   = parsed.positional[0] || currentPath
  const hidden = !!parsed.flags.a

  try {
    const data = await lsAPI(path, hidden)

    data.entries.forEach(entry => {
      const isDir  = entry.node_type === "directory"
      const name   = isDir ? entry.name + "/" : entry.name
      const size   = entry.size ? formatFileSize(entry.size) : ""
      const color  = isDir ? theme.user : theme.text

      addOutput({
        type: "text",
        html: `  <span style="color:${color}">${name.padEnd(28)}</span><span style="color:${theme.muted}">${size}</span>`,
      })
    })

    addOutput({ type: "empty" })
  } catch (e) {
    addOutput({ type: "error", text: e.response?.data?.detail || "filesystem tweakin rn  [0_0]" })
  }
}