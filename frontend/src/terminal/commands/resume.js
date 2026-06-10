import { getResumeInfo, downloadResume } from "../../api/resume"
import { formatFileSize } from "../../utils/formatters"

export default async function resume({ addOutput, theme }) {
  try {
    const info = await getResumeInfo()

    if (!info.available) {
      addOutput({ type: "error", text: "Resume got lost in the sauce [x_x]" })
      return
    }

    addOutput({ type: "accent",  text: "── Professional Yap Session ─────────────" })
    addOutput({ type: "empty" })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">"Artifact:":    </span><span style="color:${theme.user}">${info.filename}</span>`,
    })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Weight:    </span><span style="color:${theme.text}">${info.size_kb} KB</span>`,
    })
    addOutput({
      type: "text",
      html: `  <span style="color:${theme.muted}">Last cooked: </span><span style="color:${theme.text}">${info.last_updated}</span>`,
    })
    addOutput({ type: "empty" })
    addOutput({ type: "success", text: "  Sending the motion..." })

    downloadResume()

    addOutput({ type: "muted", text: "   Employment artifacts opened" })
    addOutput({ type: "empty" })
  } catch {
    addOutput({ type: "error", text: "Resume servers fighting demons rn [x_x]" })
  }
}
