import { useEffect, useState } from "react"
import { getExperience } from "../../api/experience"
import client from "../../api/client"

export default function Experience() {
  const [items, setItems]   = useState([])
  const [form, setForm]     = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => getExperience().then(setItems).catch(() => {})

  useEffect(() => { load() }, [])

  const blank = {
    type: "work", title: "", organization: "", location: "",
    description: "", highlights: [], tech_stack: [], start_date: "", end_date: "", is_current: false, order: 0,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (form.id) {
        await client.patch(`/experience/${form.id}`, form)
      } else {
        await client.post("/experience", form)
      }
      setForm(null)
      load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return
    await client.delete(`/experience/${id}`)
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5" }}>Experience</h1>
          <p style={{ fontSize: "13px", color: "#565f89" }}>Work and education entries</p>
        </div>
        <button onClick={() => setForm(blank)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
          + Add
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {items.map(e => (
          <div key={e.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", color: "#c0caf5", fontWeight: 500 }}>{e.title}</div>
              <div style={{ fontSize: "12px", color: "#565f89" }}>{e.organization} · {e.start_date} → {e.is_current ? "Present" : e.end_date}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setForm(e)} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(187,154,247,0.1)", border: "1px solid rgba(187,154,247,0.2)", color: "#bb9af7", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(e.id)} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)", color: "#f7768e", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {form && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", maxWidth: "600px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#c0caf5", marginBottom: "20px" }}>
            {form.id ? "Edit Entry" : "New Entry"}
          </div>

          {[
            ["Title", "title"], ["Organization", "organization"],
            ["Location", "location"], ["Start Date", "start_date"],
            ["End Date", "end_date"],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>{label.toUpperCase()}</label>
              <input
                value={form[key] || ""}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "8px 12px", color: "#c0caf5", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
              />
            </div>
          ))}

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>TYPE</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "8px 12px", color: "#c0caf5", fontSize: "13px", outline: "none" }}
            >
              <option value="work">Work</option>
              <option value="education">Education</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>DESCRIPTION</label>
            <textarea
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "8px 12px", color: "#c0caf5", fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setForm(null)}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#888", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}