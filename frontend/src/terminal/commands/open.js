import { getProfile } from "../../api/profile"

const PLATFORM_MAP = {
  github:   "github",
  linkedin: "linkedin",
  telegram: "telegram",
  chess:    "chess",
  leetcode: "leetcode",
}

export default async function open({ parsed, addOutput, theme }) {
  const target = parsed.positional[0]?.toLowerCase()

  if (!target) {
    addOutput({ type: "error",  text: "Usage: open <github|linkedin|telegram|chess|leetcode> \nu gotta tell me what portal gang" })
    return
  }

  try {
    const profile = await getProfile()
    const links   = profile.social_links || []
    const link    = links.find(l => l.platform.toLowerCase() === target)

    if (!link) {
      addOutput({ type: "error", text: `'${target}' portal missing twin [x_x]` })
      return
    }

    addOutput({
      type: "success",
      text: `  Entering the ${link.platform} dimension...`,
    })
    addOutput({
      type: "muted",
      html: `  <span style="color:${theme.user}">${link.url}</span>`,
    })

    window.open(link.url, "_blank")
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Portals offline rn [x_x]" })
  }
}