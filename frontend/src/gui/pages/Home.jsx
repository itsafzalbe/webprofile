import { useEffect, useState } from "react"
import { Link }                from "react-router-dom"
import { motion }              from "framer-motion"
import { useThemeStore }       from "../../store/useThemeStore"
import { guiThemes }           from "../guiTheme"
import { makeStyles, hoverBorder } from "../guiStyles"
import { getProfile }          from "../../api/profile"
import { getPinnedRepos, getGithubProfile } from "../../api/github"
import { getProjects }         from "../../api/projects"

export default function Home() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [profile,  setProfile]  = useState(null)
  const [pinned,   setPinned]   = useState([])
  const [github,   setGithub]   = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {})
    getPinnedRepos().then(d => setPinned(Array.isArray(d) ? d : [])).catch(() => {})
    getGithubProfile().then(setGithub).catch(() => {})
    getProjects().then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  return (
    <div style={s.page}>

      {/* Hero */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} style={{ marginBottom:"56px" }}>
        <div style={s.availBadge(profile?.available_for_work)}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
          {profile?.available_for_work ? "Available for work" : "Not available"}
        </div>
        <h1 style={s.heroName}>{profile?.full_name || "Afzalbek"}</h1>
        <p style={s.heroTitle}>{profile?.title || "Backend Developer"}</p>
        <p style={{ fontSize:"15px", color:t.textMuted, lineHeight:1.7, maxWidth:"560px", margin:0 }}>{profile?.bio}</p>

        <div style={{ display:"flex", gap:"12px", marginTop:"28px", flexWrap:"wrap" }}>
          <Link to="/gui/projects" style={{ ...s.btnPrimary, textDecoration:"none", display:"inline-block" }}>View Projects</Link>
          <Link to="/gui/contact"  style={{ ...s.btnSecondary, textDecoration:"none", display:"inline-block" }}>Get in touch</Link>
        </div>
      </motion.div>

      {/* Stats */}
      {github && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.08 }} style={s.statGrid}>
          {[
            { label:"Public repos", value:github.public_repos },
            { label:"Followers",    value:github.followers    },
            { label:"Projects",     value:projects.length     },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...s.card, padding:"20px 24px" }}>
              <div style={{ fontSize:"28px", fontWeight:700, color:t.accent, letterSpacing:"-0.02em" }}>{value ?? "—"}</div>
              <div style={{ fontSize:"12px", color:t.textMuted, marginTop:"4px" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Pinned repos */}
      {pinned.length > 0 && (
        <motion.section initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.12 }} style={{ marginBottom:"48px" }}>
          <SectionHeader title="Pinned Repos" t={t} s={s} />
          <div style={s.cardGrid}>
            {pinned.map(repo => (
              <HoverCard key={repo.name} href={repo.html_url || repo.url} t={t} s={s}>
                <div style={{ fontSize:"13px", fontWeight:600, color:t.accent, marginBottom:"6px" }}>{repo.name}</div>
                <div style={{ fontSize:"12px", color:t.textMuted, lineHeight:1.6, marginBottom:"12px", flex:1 }}>
                  {repo.description || "No description"}
                </div>
                <div style={{ display:"flex", gap:"12px" }}>
                  {repo.language && <span style={{ fontSize:"11px", color:t.textFaint }}>● {repo.language}</span>}
                  {repo.stargazers_count > 0 && <span style={{ fontSize:"11px", color:t.textFaint }}>★ {repo.stargazers_count}</span>}
                </div>
              </HoverCard>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent projects */}
      {projects.length > 0 && (
        <motion.section initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.16 }}>
          <SectionHeader title="Recent Projects" t={t} s={s} action={{ label:"All projects →", to:"/gui/projects" }} />
          <div style={s.cardGrid}>
            {projects.slice(0, 4).map(p => (
              <HoverCard key={p.slug} to={`/gui/projects/${p.slug}`} t={t} s={s}>
                <div style={{ fontSize:"13px", fontWeight:600, color:t.text, marginBottom:"6px" }}>{p.title}</div>
                <div style={{ fontSize:"12px", color:t.textMuted, lineHeight:1.6, marginBottom:"12px", flex:1 }}>
                  {p.description?.slice(0,90)}{p.description?.length > 90 ? "…" : ""}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {p.tech_stack?.slice(0,3).map(s2 => <span key={s2} style={s.tag}>{s2}</span>)}
                </div>
              </HoverCard>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}

function SectionHeader({ title, t, s, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
      <div style={{ ...s.sectionLabel, marginBottom:0 }}>{title}</div>
      {action && <Link to={action.to} style={{ fontSize:"12px", color:t.accent, textDecoration:"none" }}>{action.label}</Link>}
    </div>
  )
}

function HoverCard({ children, href, to, t, s }) {
  const [hovered, setHovered] = useState(false)
  const style = {
    ...s.card,
    padding:"20px",
    textDecoration:"none",
    display:"flex",
    flexDirection:"column",
    borderColor: hovered ? t.borderHover : t.glassBorder,
    transition:"border-color 0.15s",
  }
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{children}</a>
  return <Link to={to} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{children}</Link>
}
