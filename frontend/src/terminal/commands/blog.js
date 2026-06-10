import { getPosts, getPost } from "../../api/blog"
import { formatDate, formatReadTime } from "../../utils/formatters"

export default async function blog({ parsed, addOutput, theme }) {
  const slug = parsed.positional[0]

  // Single post
  if (slug) {
    try {
      const post = await getPost(slug)
      addOutput({ type: "accent", text: `── ${post.title} ` })
      addOutput({ type: "empty" })
      addOutput({
        type: "text",
        html: `  <span style="color:${theme.muted}">${formatDate(post.created_at)}  ·  ${formatReadTime(post.read_time)}  ·  ${post.view_count} views</span>`,
      })
      addOutput({ type: "empty" })
      addOutput({ type: "muted",  text: `  ${post.excerpt}` })
      addOutput({ type: "empty" })

      // Render markdown as plain text in terminal
      const plain = post.content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

      plain.split("\n").slice(0, 30).forEach(line => {
        addOutput({ type: "text", text: `  ${line}` })
      })

      if (post.content.split("\n").length > 30) {
        addOutput({ type: "empty" })
        addOutput({ type: "muted", text: "... bro wrote too much [x_x] read the rest on the site" })
      }

      addOutput({ type: "empty" })
    } catch {
      addOutput({ type: "error", text: `Couldnt find that post twin [>_<]` })
    }
    return
  }

  // Post list
  try {
    const params = {}
    if (parsed.flags.tag)      params.tag      = parsed.flags.tag
    if (parsed.flags.category) params.category = parsed.flags.category

    const data = await getPosts(params)
    const posts = data.items || []

    addOutput({ type: "accent", text: "── Brain Rot Archives ──────────────────────────────────────────────────────" })
    addOutput({ type: "empty" })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">${"THOUGHT".padEnd(36)}${"DATE".padEnd(14)}BRAIN DAMAGE</span>`,
    })
    addOutput({ type: "muted", text: "  " + "─".repeat(60) })

    posts.forEach(p => {
      const title = p.title.slice(0, 34).padEnd(36)
      const date  = formatDate(p.created_at).padEnd(14)
      const time  = formatReadTime(p.read_time)

      addOutput({
        type: "text",
        html: `  <span style="color:${theme.user}">${title}</span><span style="color:${theme.muted}">${date}${time}</span>`,
      })
    })

    addOutput({ type: "empty" })
    addOutput({ type: "muted", text: ` ${posts.length} brain rot archive${posts.length !== 1 ? "s" : ""} loaded` })
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Brain not loading rn [o_O]" })
  }
}