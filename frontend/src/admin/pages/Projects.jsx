import { useEffect, useState } from "react"
import { adminGetAll, createProject, updateProject, deleteProject } from "../../api/projects"

// ── Shared input styles ───────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
  padding: "8px 12px", color: "#c0caf5", fontSize: "13px",
  fontFamily: "inherit", outline: "none",
}
const labelStyle = {
  fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px",
}

// ── Input component defined OUTSIDE the parent — critical to prevent remount on each keystroke ──
function Input({ label, field, type, form, setForm }) {
  const value   = form?.[field] ?? ""
  const onChange = (e) => setForm(f => ({ ...f, [field]: type === "checkbox" ? e.target.checked : e.target.value }))

  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={labelStyle}>{label.toUpperCase()}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : type === "checkbox" ? (
        <input type="checkbox" checked={!!value} onChange={onChange} />
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={onChange}
          style={inputStyle}
        />
      )}
    </div>
  )
}

export default function Projects() {
  const [items, setItems]   = useState([])
  const [form, setForm]     = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => adminGetAll().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const blank = {
    title: "", slug: "", description: "", long_description: "",
    tech_stack: [], tags: [], github_url: "", live_url: "",
    is_featured: false, is_published: true, order: 0,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        tech_stack: typeof form.tech_stack === "string" ? form.tech_stack.split(",").map(s => s.trim()) : form.tech_stack,
        tags:       typeof form.tags       === "string" ? form.tags.split(",").map(s => s.trim())       : form.tags,
      }
      if (form.id) {
        await updateProject(form.slug, payload)
      } else {
        await createProject(payload)
      }
      setForm(null)
      load()
    } catch (e) {
      alert(e.response?.data?.detail || "Save failed")
    }
    setSaving(false)
  }

  const handleDelete = async (slug) => {
    if (!confirm("Delete project?")) return
    await deleteProject(slug)
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5" }}>Projects</h1>
          <p style={{ fontSize: "13px", color: "#565f89" }}>{items.length} total</p>
        </div>
        <button onClick={() => setForm(blank)}
          style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
          + New Project
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {items.map(p => (
          <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#c0caf5", fontWeight: 500 }}>{p.title}</span>
                {p.is_featured && <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,158,100,0.15)", color: "#ff9e64" }}>featured</span>}
                {!p.is_published && <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(247,118,142,0.15)", color: "#f7768e" }}>draft</span>}
              </div>
              <div style={{ fontSize: "12px", color: "#565f89", marginTop: "2px" }}>
                {p.tech_stack?.slice(0, 4).join(", ")}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setForm({ ...p, tech_stack: p.tech_stack?.join(", "), tags: p.tags?.join(", ") })}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(187,154,247,0.1)", border: "1px solid rgba(187,154,247,0.2)", color: "#bb9af7", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(p.slug)}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)", color: "#f7768e", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", maxWidth: "600px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#c0caf5", marginBottom: "20px" }}>{form.id ? "Edit Project" : "New Project"}</div>

          <Input label="Title"            field="title"            form={form} setForm={setForm} />
          <Input label="Slug"             field="slug"             form={form} setForm={setForm} />
          <Input label="Description"      field="description"      type="textarea" form={form} setForm={setForm} />
          <Input label="Long Description" field="long_description" type="textarea" form={form} setForm={setForm} />
          <Input label="Tech Stack (comma separated)" field="tech_stack" form={form} setForm={setForm} />
          <Input label="Tags (comma separated)"       field="tags"       form={form} setForm={setForm} />
          <Input label="GitHub URL"       field="github_url"       form={form} setForm={setForm} />
          <Input label="Live URL"         field="live_url"         form={form} setForm={setForm} />

          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_featured || false} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
              Featured
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_published || false} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              Published
            </label>
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