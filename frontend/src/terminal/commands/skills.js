import { getProfile } from "../../api/profile"

export default async function skills({ addOutput, theme }) {
  try {
    const p = await getProfile()

    addOutput({ type: "accent", text: "── Things I Somehow Understand ────────────────────────────────" })
    addOutput({ type: "empty" })

    const skills = p.skills_summary || []
    const rows   = []

    for (let i = 0; i < skills.length; i += 3) {
      const row = skills.slice(i, i + 3)
      rows.push(row)
    }

    rows.forEach(row => {
      const line = row.map(s => s.padEnd(22)).join("")
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.path}">${line}</span>`,
      })
    })

    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Skill tree unavailable rn [x_x]" })
  }
}