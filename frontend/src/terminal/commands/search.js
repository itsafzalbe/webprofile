import { search as searchAPI } from "../../api/search"

export default async function search({ parsed, addOutput, theme }) {
  const query = parsed.positional.join(" ")

  if (!query) {
    addOutput({ type: "error",  text: "Usage: search <query> [--type projects|blog|skills|files]" })
    return
  }

  const type = parsed.flags.type || "all"

  addOutput({ type: "muted", text: `  Searching the archives for "${query}"...` })

  try {
    const data = await searchAPI(query, type)

    if (data.total === 0) {
      addOutput({ type: "muted", text: `  Nothing cooked up for "${query}" [>_<]` })
      addOutput({ type: "empty" })
      return
    }

    addOutput({ type: "accent", text: `── Lore Search: "${query}" • ${data.total} hit${data.total !== 1 ? "s" : ""} (${data.took_ms}ms) ──` })
    addOutput({ type: "empty" })

    data.results.forEach(r => {
      const typeLabel = `[${r.type}]`.padEnd(10)
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.branch}">${typeLabel}</span> <span style="color:${theme.user}">${r.title}</span>`,
      })
      if (r.excerpt) {
        addOutput({ type: "muted", text: `             ${r.excerpt}` })
      }
    })

    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Search engine fighting demons rn [-_-]" })
  }
}