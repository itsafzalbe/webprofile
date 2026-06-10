import { getProjects, getProject } from "../../api/projects"

export default async function projects({ parsed, addOutput, theme }) {
  const slug = parsed.positional[0]

  if (slug) {
    try {
      const p = await getProject(slug)
      addOutput({ type: "accent", text: `── ${p.title} ${"─".repeat(Math.max(0, 40 - p.title.length))}` })
      addOutput({ type: "empty" })
      addOutput({ type: "text",   text: `  ${p.description}` })
      addOutput({ type: "empty" })

      if (p.long_description) {
        addOutput({ type: "muted", text: `  ${p.long_description}` })
        addOutput({ type: "empty" })
      }

      addOutput({
        type: "text",
        html: `  <span style="color:${theme.muted}">Cooked with:  </span><span style="color:${theme.path}">${p.tech_stack?.join(", ")}</span>`,
      })
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.muted}">Tags:   </span><span style="color:${theme.branch}">${p.tags?.join(", ")}</span>`,
      })
      if (p.github_url) {
        addOutput({
          type: "text",
          html: `  <span style="color:${theme.muted}">GitHub: </span><a href="${p.github_url}" target="_blank" style="color:${theme.user}; text-decoration:none;">${p.github_url}</a>`,
        })
      }
      if (p.live_url) {
        addOutput({
          type: "text",
          html: `<span style="color:${theme.muted}">Live: </span> <a href="${p.live_url}" target="_blank" style="color:${theme.branch}; text-decoration:none;">${p.live_url}</a>`,
        })
      }
      if (p.challenges) {
        addOutput({ type: "empty" })
        addOutput({ type: "accent", text: "  Challenges" })
        addOutput({ type: "muted",  text: `  ${p.challenges}` })
      }
      addOutput({ type: "empty" })
    } catch {
      addOutput({ type: "error", text: `Couldnt find that cook twin [-_-]` })
    }
    return
  }

  try {
    const params = {}
    if (parsed.flags.tag)      params.tag      = parsed.flags.tag
    if (parsed.flags.featured) params.featured = true

    const data = await getProjects(params)

    addOutput({ type: "accent", text: "── Cooked Projects ───────────────────────────────────────────────────────────────────────────" })
    addOutput({ type: "empty" })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">${"NAME".padEnd(20)}${"SLUG".padEnd(20)}${"BUILT WITH".padEnd(35)}PORTALS</span>`,
    })
    addOutput({ type: "muted", text: "  " + "─".repeat(85) })

    data.forEach(p => {
      const name  = p.title.slice(0, 18).padEnd(20)
      const slug  = (p.slug || "").slice(0, 20).padEnd(20)
      const stack = (p.tech_stack?.slice(0, 3).join(", ") || "").slice(0, 28).padEnd(35)
      const links = [
            p.github_url
              ? `<a href="${p.github_url}" target="_blank" style="color:${theme.user}; text-decoration:none;">GitHub</a>`
              : "",
            p.live_url
              ? `<a href="${p.live_url}" target="_blank" style="color:${theme.branch}; text-decoration:none;">Live</a>`
              : ""
          ]
          .filter(Boolean)
          .join(", ")

      addOutput({
        type: "text",
        html: `  <span style="color:${theme.user}">${name}</span><span style="color:${theme.path}">${slug}</span><span style="color:${theme.path}">${stack}</span><span style="color:${theme.muted}">${links}</span>`,
      })
    })

    addOutput({ type: "empty" })
    addOutput({ type: "muted", text: `${data.length} cook${data.length !== 1 ? "s" : ""} available • run 'projects <slug>' for the lore` })
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Project database tweakin rn [x_x]" })
  }
}
