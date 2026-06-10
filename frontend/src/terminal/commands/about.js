import { getProfile } from "../../api/profile"

export default async function about({ addOutput, theme }) {
  try {
    const p = await getProfile()

    addOutput({ type: "accent",  text: "── Lore Drop ─────────────────────────────" })
    addOutput({ type: "empty" })
    addOutput({ type: "user",    text: `  ${p.full_name}` })
    addOutput({ type: "text",    text: `  ${p.title}` })
    addOutput({ type: "muted",   text: `  ${p.location}, ${p.country}` })
    addOutput({ type: "empty" })
    addOutput({ type: "text",    text: `  ${p.bio}` })
    addOutput({ type: "empty" })

    const status = p.available_for_work
      ? "✔︎ currently locked in for opportunities"
      : "✗ unavailable rn"
    addOutput({ type: p.available_for_work ? "success" : "error", text: `  ${status}` })
    addOutput({ type: "empty" })

    addOutput({ type: "accent", text: "  Portals" })
    p.social_links?.forEach(link => {
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.user}">${link.platform.padEnd(12)}</span><span style="color:${theme.muted}"><a href="${link.url}" target="_blank" style="color:${theme.branch}; text-decoration:none;">tap in</a></span>`,
      })
    })

    addOutput({ type: "empty" })
    addOutput({ type: "muted", text: "  Languages patched in: " + p.languages?.join(", ") })
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Couldnt load the lore rn [x_x]" })
  }
}
