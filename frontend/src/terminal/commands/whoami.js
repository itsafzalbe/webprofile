import { getWhoami } from "../../api/profile"

export default async function whoami({ addOutput }) {
  try {
    const data = await getWhoami()
    const lines = data.output.split("\n")
    lines.forEach((line, i) => {
      addOutput({
        type: i === 0 ? "user" : i === 1 ? "accent" : "muted",
        text: line,
      })
    })
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Identity crisis rn [x_x]" })
  }
}
