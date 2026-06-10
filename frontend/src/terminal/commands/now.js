import { getHealth } from "../../api/system"

export default async function now({ addOutput, theme }) {
  const now  = new Date()
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  addOutput({ type: "accent", text: "── Reality Check ─────────────────────────" })
  addOutput({ type: "empty" })
  addOutput({
    type: "text",
    html: `  <span style="color:${theme.muted}">Date:    </span><span style="color:${theme.text}">${date}</span>`,
  })
  addOutput({
    type: "text",
    html: `  <span style="color:${theme.muted}">Time:    </span><span style="color:${theme.text}">${time}</span>`,
  })

  try {
    const health = await getHealth()
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Backend vibes: </span><span style="color:${theme.success}">${health.status}</span>`,
    })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Mongo cook status: </span><span style="color:${theme.success}">${health.mongodb}</span>`,
    })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Redis aura::   </span><span style="color:${theme.success}">${health.redis}</span>`,
    })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Still standing for::  </span><span style="color:${theme.path}">${health.uptime}</span>`,
    })
  } catch {
    addOutput({ type: "error", text: "  backend fighting demons rn [x_x]" })
  }

  addOutput({ type: "empty" })
}