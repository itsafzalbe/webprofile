import { useEffect, useState } from "react"
import { getProfile, updateProfile } from "../../api/profile"

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
  padding: "10px 12px", color: "#c0caf5", fontSize: "13px",
  fontFamily: "inherit", outline: "none",
}

// ── Field defined OUTSIDE parent — prevents remount on every keystroke ────────
function Field({ label, field, type, form, onChange }) {
  const value = form?.[field] ?? ""

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "11px", color: "#565f89", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>
        {label.toUpperCase()}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={e => onChange(field, e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(field, e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer" }}
        />
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}

export default function Profile() {
  const [form, setForm]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState("")

  useEffect(() => {
    getProfile().then(setForm).catch(() => {})
  }, [])

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg("")
    try {
      await updateProfile(form)
      setMsg("Saved successfully.")
    } catch {
      setMsg("Save failed.")
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <div style={{ color: "#565f89", fontSize: "13px" }}>Loading...</div>

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Profile</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "24px" }}>Edit your public profile</p>

      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px", padding: "24px", maxWidth: "600px",
      }}>
        <Field label="Full Name"          field="full_name"           form={form} onChange={handleChange} />
        <Field label="Title"              field="title"               form={form} onChange={handleChange} />
        <Field label="Short Bio"          field="short_bio"           form={form} onChange={handleChange} />
        <Field label="Bio"                field="bio"                 type="textarea" form={form} onChange={handleChange} />
        <Field label="Location"           field="location"            form={form} onChange={handleChange} />
        <Field label="Country"            field="country"             form={form} onChange={handleChange} />
        <Field label="Email"              field="email"               type="email" form={form} onChange={handleChange} />
        <Field label="Available for Work" field="available_for_work"  type="checkbox" form={form} onChange={handleChange} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px", borderRadius: "8px", fontSize: "13px",
              background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)",
              color: "#7dcfff", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {msg && <span style={{ fontSize: "12px", color: msg.includes("fail") ? "#f7768e" : "#9ece6a" }}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}