import { useEffect, useState } from "react"
import { ls, getNode } from "../../api/filesystem"
import client from "../../api/client"
import { HOME_PATH } from "../../utils/constants"

export default function Filesystem() {
  const [path, setPath]     = useState(HOME_PATH)
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [editing, setEditing]   = useState(false)
  const [content, setContent]   = useState("")

  const load = () => {
    ls(path, true).then(d => setEntries(d.entries || [])).catch(() => {})
  }

  useEffect(() => { load() }, [path])

  const handleSelect = async (entry) => {
    setSelected(entry)
    if (entry.node_type === "file") {
      const node = await getNode(entry.path)
      setContent(node.content || "")
    }
    setEditing(false)
  }

  const handleSaveContent = async () => {
    await client.patch(`/filesystem/node?path=${selected.path}`, { content })
    setEditing(false)
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Filesystem</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "24px" }}>Virtual filesystem management</p>

      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#565f89", marginBottom: "12px" }}>
        cwd: <span style={{ color: "#7dcfff" }}>{path}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "16px", height: "65vh" }}>
        {/* File tree */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflowY: "auto", padding: "12px" }}>
          {path !== "/" && (
            <div
              onClick={() => setPath(p => p.split("/").slice(0, -1).join("/") || "/")}
              style={{ padding: "6px 10px", cursor: "pointer", color: "#565f89", fontSize: "13px", fontFamily: "JetBrains Mono, monospace", borderRadius: "4px" }}
            >
              ../
            </div>
          )}
          {entries.map(e => (
            <div
              key={e.path}
              onClick={() => e.node_type === "directory" ? setPath(e.path) : handleSelect(e)}
              style={{
                padding:      "6px 10px",
                cursor:       "pointer",
                borderRadius: "4px",
                fontSize:     "13px",
                fontFamily:   "JetBrains Mono, monospace",
                color:        selected?.path === e.path ? "#fff" : e.node_type === "directory" ? "#7dcfff" : "#c0caf5",
                background:   selected?.path === e.path ? "rgba(125,207,255,0.08)" : "transparent",
                opacity:      e.is_hidden ? 0.5 : 1,
              }}
            >
              {e.node_type === "directory" ? "📁 " : "📄 "}{e.name}{e.node_type === "directory" ? "/" : ""}
            </div>
          ))}
        </div>

        {/* File content */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", overflowY: "auto" }}>
          {!selected ? (
            <div style={{ color: "#565f89", fontSize: "13px" }}>Select a file to view or edit</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#c0caf5", fontWeight: 500 }}>{selected.name}</div>
                {selected.node_type === "file" && (
                  <button
                    onClick={() => editing ? handleSaveContent() : setEditing(true)}
                    style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
                    {editing ? "Save" : "Edit"}
                  </button>
                )}
              </div>

              {selected.node_type === "file" && (
                editing ? (
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px", padding: "12px", color: "#c0caf5", fontSize: "12px",
                      fontFamily: "JetBrains Mono, monospace", outline: "none", resize: "none", height: "400px",
                    }}
                  />
                ) : (
                  <pre style={{ fontSize: "12px", color: "#c0caf5", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-words" }}>
                    {content}
                  </pre>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}