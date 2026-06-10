import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPost, createPost, updatePost } from "../../api/blog"

export default function BlogEditor() {
  const { slug }     = useParams()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({
    title: "", slug: "", excerpt: "", content: "",
    tags: "", category: "", is_published: false,
  })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (slug) {
      getPost(slug).then(p => setForm({ ...p, tags: p.tags?.join(", ") })).catch(() => {})
    }
  }, [slug])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : form.tags,
      }
      if (slug) await updatePost(slug, payload)
      else await createPost(payload)
      navigate("/admin/blog")
    } catch (e) {
      alert(e.response?.data?.detail || "Save failed")
    }
    setSaving(false)
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
    padding: "8px 12px", color: "#c0caf5", fontSize: "13px",
    fontFamily: "inherit", outline: "none",
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5" }}>{slug ? "Edit Post" : "New Post"}</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setPreview(p => !p)}
            style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", cursor: "pointer" }}>
            {preview ? "Edit" : "Preview"}
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => navigate("/admin/blog")}
            style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#888", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>TITLE</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>SLUG</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>TAGS (comma separated)</label>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>CATEGORY</label>
          <input value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>EXCERPT</label>
        <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
          style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "4px" }}>
          CONTENT (Markdown)
        </label>
        {preview ? (
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px", padding: "16px", color: "#c0caf5", fontSize: "13px",
            lineHeight: "1.7", minHeight: "400px", whiteSpace: "pre-wrap",
          }}>
            {form.content}
          </div>
        ) : (
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={20}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "JetBrains Mono, monospace", lineHeight: "1.6" }}
          />
        )}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#888", cursor: "pointer" }}>
        <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
        Publish immediately
      </label>
    </div>
  )
}