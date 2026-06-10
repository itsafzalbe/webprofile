import { getExperience } from "../../api/experience"
import { formatDate } from "../../utils/formatters"

export default async function experience({ parsed, addOutput, theme, hideTitle = false }) {
  try {
    const type = parsed.flags.work
      ? "work"
      : parsed.flags.education
      ? "education"
      : null

    const data = await getExperience(type)
    if (!hideTitle) {
    addOutput({
      type: "accent",
      text: "── Character Development ─────────────────"
    })

    }
    addOutput({ type: "empty" })

    data.forEach((e, i) => {
      const isLast  = i === data.length - 1
      const end     = e.is_current ? "rn" : formatDate(e.end_date)
      const period  = `${formatDate(e.start_date)} → ${end}`

      const typeTag =
        e.type === "work" ? "grind" : "academia"

      addOutput({
        type: "text",
        html: `<span style="color:${theme.branch}"> [${typeTag}]</span><span style="color:${theme.user}"> ${e.title}</span>`,
      })

      addOutput({
        type: "text",
        html: `<span style="color:${theme.muted}"> ${e.organization}${e.location ? " · " + e.location : ""} </span>`,
      })

      addOutput({
        type: "text",
        html: `<span style="color:${theme.path}"> ${period} </span>`,
      })

      if (e.highlights?.length) {
        e.highlights.forEach(h => {
          addOutput({type: "muted", text: `   • ${h}`
          })
        })
      }

      if (e.tech_stack?.length) {
        addOutput({
          type: "text",
          html: `<span style="color:${theme.muted}"> cooked with → </span> <span style="color:${theme.path}"> ${e.tech_stack.join(", ")}</span>`,
        })
      }

      if (!isLast) {
        addOutput({
          type: "muted",
          text: "   │"
        })
      }

      addOutput({ type: "empty" })
    })

  } catch {
    addOutput({
      type: "error",
      text: "timeline corrupted twin [x_x]"
    })
  }
}