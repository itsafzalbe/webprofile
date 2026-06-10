import { useEffect, useState } from "react"
import { getMessages, markRead, markSpam, deleteMessage } from "../../api/contact"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    getMessages().then(d => {
      setMessages(d.items || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    await markRead(id)
    load()
  }

  const handleSpam = async (id) => {
    await markSpam(id)
    load()
    setSelected(null)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return
    await deleteMessage(id)
    load()
    setSelected(null)
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Messages</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "24px" }}>Contact form submissions</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px", height: "70vh" }}>
        {/* List */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          overflowY:    "auto",
        }}>
          {loading && <div style={{ padding: "20px", color: "#565f89", fontSize: "13px" }}>Loading...</div>}
          {messages.map(m => (
            <div
              key={m.id}
              onClick={() => { setSelected(m); handleRead(m.id) }}
              style={{
                padding:       "14px 16px",
                borderBottom:  "1px solid rgba(255,255,255,0.04)",
                cursor:        "pointer",
                background:    selected?.id === m.id ? "rgba(125,207,255,0.06)" : "transparent",
                transition:    "background 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: m.is_read ? "#888" : "#c0caf5", fontWeight: m.is_read ? 400 : 600 }}>
                  {m.name}
                </span>
                {!m.is_read && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7dcfff", display: "inline-block" }} />
                )}
              </div>
              <div style={{ fontSize: "11px", color: "#565f89", marginTop: "2px" }}>{m.email}</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.subject || m.message?.slice(0, 40)}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding:      "24px",
          overflowY:    "auto",
        }}>
          {!selected ? (
            <div style={{ color: "#565f89", fontSize: "13px" }}>Select a message to read</div>
          ) : (
            <>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#c0caf5" }}>{selected.name}</div>
                <div style={{ fontSize: "12px", color: "#7dcfff", marginTop: "4px" }}>{selected.email}</div>
                {selected.subject && (
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{selected.subject}</div>
                )}
                <div style={{ fontSize: "11px", color: "#565f89", marginTop: "6px" }}>
                  {new Date(selected.created_at).toLocaleString()}
                </div>
              </div>

              <div style={{
                fontSize:      "13px",
                color:         "#c0caf5",
                lineHeight:    "1.7",
                padding:       "16px",
                background:    "rgba(255,255,255,0.02)",
                borderRadius:  "8px",
                marginBottom:  "20px",
                whiteSpace:    "pre-wrap",
              }}>
                {selected.message}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleSpam(selected.id)}
                  style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "rgba(255,158,100,0.1)", border: "1px solid rgba(255,158,100,0.2)", color: "#ff9e64" }}>
                  Mark Spam
                </button>
                <button onClick={() => handleDelete(selected.id)}
                  style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)", color: "#f7768e" }}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}