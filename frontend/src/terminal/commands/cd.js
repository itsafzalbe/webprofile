import { cd as cdAPI } from "../../api/filesystem"
import { useTerminalStore } from "../../store/useTerminalStore"

export default async function cd({ parsed, addOutput, theme }) {
  const { currentPath, setPath } = useTerminalStore.getState()
  const target = parsed.positional[0] || "~"

  try {
    const data = await cdAPI(currentPath, target)
    setPath(data.path)
  } catch (e) {
    addOutput({ type: "error", text: e.response?.data?.detail || `${target} doesnt exist twin [x_x]` })
  }
}