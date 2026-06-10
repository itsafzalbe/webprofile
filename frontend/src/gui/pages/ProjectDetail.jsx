import { useEffect, useState } from "react"
import { useParams, Link }     from "react-router-dom"
import { useThemeStore }       from "../../store/useThemeStore"
import { guiThemes }           from "../guiTheme"
import { makeStyles }          from "../guiStyles"
import { getProject }          from "../../api/projects"

export default function ProjectDetail() {
  const { slug }     = useParams()
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)
  const [p, setP]     = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => { getProject(slug).then(setP).catch(() => setErr(true)) }, [slug])

  if (err) return <div style={s.page}><p style={{ color:t.textMuted }}>Project not found. <Link to="/gui/projects" style={{ color:t.accent }}>← Back</Link></p></div>
  if (!p)  return <div style={s.page}><p style={{ color:t.textMuted }}>Loading…</p></div>

  return (
    <div style={s.pageNarrow}>
      <Link to="/gui/projects" style={s.backLink}>← Projects</Link>
      <h1 style={s.pageTitle}>{p.title}</h1>
      <p style={{ fontSize:"15px", color:t.textMuted, lineHeight:1.7, margin:"0 0 32px" }}>{p.description}</p>

      <div style={{ display:"flex", gap:"10px", marginBottom:"36px" }}>
        {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ ...s.btnSecondary, textDecoration:"none" }}>GitHub ↗</a>}
        {p.live_url   && <a href={p.live_url}   target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary,    textDecoration:"none" }}>Live demo ↗</a>}
      </div>

      {p.tech_stack?.length > 0 && (
        <div style={{ ...s.card, padding:"20px 24px", marginBottom:"14px" }}>
          <div style={s.sectionLabel}>Tech Stack</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {p.tech_stack.map(sk => <span key={sk} style={{ ...s.tag, fontSize:"12px", padding:"4px 10px", borderRadius:"6px" }}>{sk}</span>)}
          </div>
        </div>
      )}

      {p.tags?.length > 0 && (
        <div style={{ ...s.card, padding:"20px 24px", marginBottom:"14px" }}>
          <div style={s.sectionLabel}>Tags</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {p.tags.map(tag => <span key={tag} style={s.tagNeutral}>{tag}</span>)}
          </div>
        </div>
      )}

      {p.long_description && (
        <div style={{ ...s.card, padding:"24px", marginBottom:"14px" }}>
          <div style={s.sectionLabel}>Overview</div>
          <p style={{ fontSize:"14px", color:t.textMuted, lineHeight:1.8, margin:0 }}>{p.long_description}</p>
        </div>
      )}

      {p.challenges && (
        <div style={{ ...s.card, padding:"24px" }}>
          <div style={s.sectionLabel}>Challenges</div>
          <p style={{ fontSize:"14px", color:t.textMuted, lineHeight:1.8, margin:0 }}>{p.challenges}</p>
        </div>
      )}
    </div>
  )
}
