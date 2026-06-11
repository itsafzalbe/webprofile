import { useEffect, useState } from "react"
import { getMessages, markRead, markSpam, deleteMessage } from "../../api/contact"

export default function Messages() {
  const [messages,  setMessages]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error,     setError]     = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const d = await getMessages()
      setMessages(d.items || [])
    } catch {
      setError("Failed to load messages.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSelect = async (m) => {
    setSelected(m)
    if (!m.is_read) {
      try {
        await markRead(m.id)
        setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, is_read: true } : msg))
      } catch {}
    }
  }

  const handleSpam = async (id) => {
    try {
      await markSpam(id)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_spam: true } : m))
      if (selected?.id === id) setSelected(null)
    } catch {
      setError("Failed to mark as spam.")
    }
  }

  const handleDelete = async (id, e) => {
    // stop click from bubbling to the row's onClick (select handler)
    e?.stopPropagation()
    if (!confirm("Delete this message?")) return
    setDeletingId(id)
    setError("")
    try {
      await deleteMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      setError("Failed to delete message. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const btnBase = {
    padding: "5px 12px", borderRadius: "6px", fontSize: "12px",
    cursor: "pointer", border: "none", fontFamily: "inherit",
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Messages</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "16px" }}>Contact form submissions</p>

      {error && (
        <div style={{
          marginBottom: "16px", padding: "10px 14px", borderRadius: "8px",
          background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)",
          color: "#f7768e", fontSize: "12px", display: "flex", justifyContent: "space-between",
        }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f7768e", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px", height: "70vh" }}>

        {/* ── Message list ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", overflowY: "auto",
        }}>
          {loading && <div style={{ padding: "20px", color: "#565f89", fontSize: "13px" }}>Loading...</div>}
          {!loading && messages.length === 0 && (
            <div style={{ padding: "20px", color: "#565f89", fontSize: "13px" }}>No messages yet.</div>
          )}
          {messages.map(m => (
            <div
              key={m.id}
              onClick={() => handleSelect(m)}
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer",
                background: selected?.id === m.id ? "rgba(125,207,255,0.06)" : "transparent",
                transition: "background 0.15s",
                display: "flex", alignItems: "flex-start", gap: "10px",
              }}
            >
              {/* Message info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: m.is_read ? "#888" : "#c0caf5", fontWeight: m.is_read ? 400 : 600 }}>
                    {m.name}
                  </span>
                  {!m.is_read && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7dcfff", display: "inline-block", flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#565f89", marginTop: "2px" }}>{m.email}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.subject || m.message?.slice(0, 40)}
                </div>
              </div>

              {/* Quick delete on the row */}
              <button
                onClick={(e) => handleDelete(m.id, e)}
                disabled={deletingId === m.id}
                title="Delete"
                style={{
                  ...btnBase,
                  background: "transparent",
                  color: deletingId === m.id ? "#555" : "#f7768e",
                  padding: "2px 6px",
                  fontSize: "16px",
                  opacity: deletingId === m.id ? 0.5 : 0.4,
                  flexShrink: 0,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = deletingId === m.id ? "0.5" : "0.4"}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* ── Detail panel ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "24px", overflowY: "auto",
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
                fontSize: "13px", color: "#c0caf5", lineHeight: "1.7",
                padding: "16px", background: "rgba(255,255,255,0.02)",
                borderRadius: "8px", marginBottom: "20px", whiteSpace: "pre-wrap",
              }}>
                {selected.message}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleSpam(selected.id)}
                  style={{ ...btnBase, background: "rgba(255,158,100,0.1)", border: "1px solid rgba(255,158,100,0.2)", color: "#ff9e64" }}
                >
                  Mark Spam
                </button>
                <button
                  onClick={(e) => handleDelete(selected.id, e)}
                  disabled={deletingId === selected.id}
                  style={{
                    ...btnBase,
                    background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)",
                    color: "#f7768e", opacity: deletingId === selected.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === selected.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}