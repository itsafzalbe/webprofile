import { useSystemStore } from "../../store/useSystemStore"

export default async function gui({ addOutput }) {
  addOutput({
    type: "success",
    text: "  escaping the terminal dimension..."
  })
  addOutput({
    type: "muted",
    text: "  touch grass mode loading [+_+]"
  })

  addOutput({ type: "empty" })

  setTimeout(() => {
    useSystemStore.getState().switchToGUI()
  }, 600)
}