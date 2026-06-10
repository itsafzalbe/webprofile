import { tree as treeAPI } from "../../api/filesystem"
import { useTerminalStore } from "../../store/useTerminalStore"

export default async function tree({ parsed, addOutput, theme }) {
  const { currentPath } = useTerminalStore.getState()
  const path = parsed.positional[0] || currentPath

  try {
    const data = await treeAPI(path, 3)

    data.rendered.split("\n").forEach(line => {
      addOutput({
        type: "text",
        html: `<span style="color:${theme.path}">${line}</span>`,
      })
    })

    addOutput({ type: "empty" })
  } catch (e) {
    addOutput({ type: "error", text: e.response?.data?.detail || "tree failed." })
  }
}