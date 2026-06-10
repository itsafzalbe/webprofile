import { useEffect, useState }   from "react"
import { Link }                  from "react-router-dom"
import { useThemeStore }         from "../../store/useThemeStore"
import { guiThemes }             from "../guiTheme"
import { makeStyles }            from "../guiStyles"
import { getProjects, getProjectTags } from "../../api/projects"

export default function Projects() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [projects, setProjects] = useState([])
  const [tags,     setTags]     = useState([])
  const [active,   setActive]   = useState("all")
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getProjectTags().then(d => setTags(Array.isArray(d) ? d : (d.tags || []))).catch(() => {})
    getProjects().then(d => { setProjects(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = active === "all" ? projects : projects.filter(p => p.tags?.includes(active))

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Projects</h1>
      <p style={s.pageSubtitle}>Things I've built.</p>

      {tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"28px" }}>
          {["all", ...tags].map(tag => (
            <button key={tag} onClick={() => setActive(tag)} style={s.filterPill(active === tag)}>{tag}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={s.cardGrid}>
          {[1,2,3,4].map(i => <div key={i} style={{ ...s.card, height:"180px", opacity:0.4 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color:t.textMuted, fontSize:"14px" }}>No projects found.</p>
      ) : (
        <div style={s.cardGrid}>
          {filtered.map(p => <ProjectCard key={p.slug} p={p} t={t} s={s} />)}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ p, t, s }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={`/gui/projects/${p.slug}`} style={{
      ...s.card, padding:"24px", textDecoration:"none",
      display:"flex", flexDirection:"column",
      borderColor: hovered ? t.borderHover : t.glassBorder,
      transition:"border-color 0.15s",
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {p.is_featured && <span style={{ fontSize:"10px", fontWeight:600, color:t.accent, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"8px" }}>Featured</span>}
      <div style={{ fontSize:"15px", fontWeight:600, color:t.text, marginBottom:"8px" }}>{p.title}</div>
      <div style={{ fontSize:"13px", color:t.textMuted, lineHeight:1.65, flex:1, marginBottom:"16px" }}>
        {p.description?.slice(0,110)}{p.description?.length > 110 ? "…" : ""}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"12px" }}>
        {p.tech_stack?.slice(0,4).map(sk => <span key={sk} style={s.tag}>{sk}</span>)}
      </div>
      <div style={{ display:"flex", gap:"12px" }}>
        {p.github_url && <span style={{ fontSize:"11px", color:t.textFaint }}>GitHub ↗</span>}
        {p.live_url   && <span style={{ fontSize:"11px", color:t.textFaint }}>Live ↗</span>}
      </div>
    </Link>
  )
}
