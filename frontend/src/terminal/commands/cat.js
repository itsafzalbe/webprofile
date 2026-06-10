import { cat as catAPI } from "../../api/filesystem"
import { useTerminalStore } from "../../store/useTerminalStore"

export default async function cat({ parsed, addOutput, theme }) {
  const { currentPath } = useTerminalStore.getState()
  const path = parsed.positional[0]

  if (!path) {
    addOutput({ type: "error", text: "u gotta tell me what file twin [^_^]" })
    return
  }

  try {
    const data = await catAPI(path, currentPath)

    data.content.split("\n").forEach(line => {
      addOutput({ type: "text", text: line })
    })

    addOutput({ type: "empty" })
  } catch (e) {
    addOutput({ type: "error", text: e.response?.data?.detail || `couldnt find ${path} twin` })
  }
}