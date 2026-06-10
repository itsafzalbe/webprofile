import { getAchievements } from "../../api/achievements"

export default async function achievements({ addOutput, theme }) {
  try {
    const data = await getAchievements()
    const list = Array.isArray(data) ? data : (data.achievements || [])

    if (list.length === 0) {
      addOutput({ type: "muted", text: " Still building the motion fr" })
      addOutput({ type: "empty" })
      return
    }

    addOutput({ type: "accent", text: "── Hall of Motion ─────────────────────────────" })
    addOutput({ type: "empty" })

    // Group by category
    const grouped = {}
    list.forEach(a => {
      const cat = a.category || "other"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(a)
    })

    Object.entries(grouped).forEach(([category, items]) => {
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.branch};font-weight:600">${category.toUpperCase()}</span>`,
      })

      items.forEach(a => {
        addOutput({
          type: "text",
          html: `  <span style="color:${theme.user}">  ${a.title}</span><span style="color:${theme.muted}">  — ${a.issuer}</span>`,
        })

        if (a.description) {
          addOutput({
            type: "text",
            html: `    <span style="color:${theme.muted}">${a.description}</span>`,
          })
        }

        if (a.credential_url) {
          addOutput({
            type: "text",
            html: `  <span style="color:${theme.muted}"> proof → </span> <a href="${a.credential_url}"target="_blank"style="color:${theme.path}; text-decoration:none;"> tap in </a>`,
          })
        }

        addOutput({ type: "empty" })
      })
    })

    addOutput({
      type: "muted",
      text: `  ${list.length} receipt${list.length !== 1 ? "s" : ""} on file`,
    })
    addOutput({ type: "empty" })

  } catch {
    addOutput({ type: "error", text: "Hall of motion temporarily unavailable" })
  }
}
