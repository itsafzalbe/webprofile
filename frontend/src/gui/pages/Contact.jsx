import { useState }       from "react"
import { motion }         from "framer-motion"
import { useThemeStore }  from "../../store/useThemeStore"
import { guiThemes }      from "../guiTheme"
import { makeStyles }     from "../guiStyles"
import { sendMessage }    from "../../api/contact"

export default function Contact() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [form, setForm]     = useState({ name:"", email:"", subject:"", message:"" })
  const [status, setStatus] = useState(null)  // null | "sending" | "success" | "error"
  const [error, setError]   = useState("")

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Name, email and message are required."); return
    }
    setStatus("sending"); setError("")
    try {
      await sendMessage(form)
      setStatus("success")
      setForm({ name:"", email:"", subject:"", message:"" })
    } catch {
      setStatus("error")
      setError("Failed to send. Please try again.")
    }
  }

  return (
    <div style={s.pageNarrow}>
      <h1 style={s.pageTitle}>Contact</h1>
      <p style={s.pageSubtitle}>Send me a message and I'll get back to you.</p>

      {status === "success" ? (
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          style={{ ...s.card, padding:"40px", textAlign:"center" }}
        >
          <div style={{ fontSize:"32px", marginBottom:"12px" }}>✓</div>
          <div style={{ fontSize:"16px", fontWeight:600, color:t.text, marginBottom:"6px" }}>Message sent!</div>
          <div style={{ fontSize:"14px", color:t.textMuted }}>I'll get back to you soon.</div>
          <button onClick={() => setStatus(null)} style={{ ...s.btnSecondary, marginTop:"20px" }}>
            Send another
          </button>
        </motion.div>
      ) : (
        <div style={{ ...s.card, padding:"32px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div>
                <label style={{ ...s.meta, display:"block", marginBottom:"6px" }}>Name *</label>
                <input placeholder="Your name" value={form.name} onChange={set("name")} style={s.input}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.inputBorder}
                />
              </div>
              <div>
                <label style={{ ...s.meta, display:"block", marginBottom:"6px" }}>Email *</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} style={s.input}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.inputBorder}
                />
              </div>
            </div>

            <div>
              <label style={{ ...s.meta, display:"block", marginBottom:"6px" }}>Subject</label>
              <input placeholder="What's this about?" value={form.subject} onChange={set("subject")} style={s.input}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.inputBorder}
              />
            </div>

            <div>
              <label style={{ ...s.meta, display:"block", marginBottom:"6px" }}>Message *</label>
              <textarea placeholder="Your message…" value={form.message} onChange={set("message")} style={s.textarea}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.inputBorder}
              />
            </div>

            {error && <div style={{ fontSize:"12px", color:t.error }}>{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ ...s.btnPrimary, alignSelf:"flex-start", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
