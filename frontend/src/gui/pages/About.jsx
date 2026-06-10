import { useEffect, useState }   from "react"
import { motion }                from "framer-motion"
import { useThemeStore }         from "../../store/useThemeStore"
import { guiThemes }             from "../guiTheme"
import { makeStyles, hoverBorder } from "../guiStyles"
import { getProfile }            from "../../api/profile"
import { getAchievements }       from "../../api/achievements"
import { formatDate }            from "../../utils/formatters"

const CATEGORY_COLORS = {
  certification: { bg: "rgba(125,207,255,0.1)",  text: "#7dcfff", label: "Cert"    },
  award:         { bg: "rgba(255,213,79,0.1)",   text: "#e0af68", label: "Award"   },
  competition:   { bg: "rgba(187,154,247,0.1)",  text: "#bb9af7", label: "Contest" },
  leadership:    { bg: "rgba(158,206,106,0.12)", text: "#9ece6a", label: "Leader"  },
  internship:    { bg: "rgba(247,118,142,0.1)",  text: "#f7768e", label: "Intern"  },
  education:     { bg: "rgba(224,175,104,0.1)",  text: "#e0af68", label: "Edu"     },
  project:       { bg: "rgba(125,207,255,0.08)", text: "#7dcfff", label: "Project" },
}

export default function About() {
  const { guiTheme }   = useThemeStore()
  const t              = guiThemes[guiTheme]
  const s              = makeStyles(t)
  const [profile, setProfile]           = useState(null)
  const [achievements, setAchievements] = useState([])
  const [achLoading, setAchLoading]     = useState(true)

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {})
    getAchievements()
      .then(d => setAchievements(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setAchLoading(false))
  }, [])

  const featured   = achievements.filter(a => a.is_featured)
  const others     = achievements.filter(a => !a.is_featured)
  const sortedAchs = [...featured, ...others]

  return (
    <div style={s.page}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} style={{ marginBottom:"48px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"28px", flexWrap:"wrap" }}>

          {/* Avatar */}
          {profile?.avatar_url ? (<img src={profile.avatar_url?.startsWith("http") ? profile.avatar_url: `http://127.0.0.1:8000${profile.avatar_url}`

  }

  alt={profile.full_name}
              style={{ width:"88px", height:"88px", borderRadius:"50%", border:`2px solid ${t.glassBorder}`, objectFit:"cover", flexShrink:0 }} />
          ) : (
            <div style={{
              width:"88px", height:"88px", borderRadius:"50%",
              background:t.accentSoft, border:`2px solid ${t.glassBorder}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"32px", color:t.accent, fontWeight:700, flexShrink:0,
            }}>{profile?.full_name?.[0] || "A"}</div>
          )}

          <div style={{ flex:1 }}>
            <div style={s.availBadge(profile?.available_for_work)}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block" }} />
              {profile?.available_for_work ? "Open to work" : "Not available"}
            </div>
            <h1 style={s.heroName}>{profile?.full_name || "Afzalbek"}</h1>
            <p style={s.heroTitle}>{profile?.title || "Backend Developer"}</p>

            <div style={{ display:"flex", flexWrap:"wrap", gap:"16px", alignItems:"center" }}>
              {profile?.location && (
                <span style={{ ...s.meta, display:"flex", alignItems:"center", gap:"5px" }}>
                  📍 {profile.location}
                </span>
              )}
             {(() => {
                const links = profile?.social_links
                if (!links) return null

                // Handle array shape: [{platform, url}, ...]
                // Handle object shape: {github: "...", linkedin: "..."}
                const entries = Array.isArray(links)
                  ? links.map(l => [l.platform, l.url])
                  : Object.entries(links)

                return entries
                  .filter(([, url]) => url)
                  .map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:"12px", color:t.accent, textDecoration:"none", textTransform:"capitalize" }}>
                      {platform} ↗
                    </a>
                  ))
              })()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio */}
      {profile?.bio && (
        <motion.section initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.06 }} style={{ marginBottom:"40px" }}>
          <div style={s.sectionLabel}>About</div>
          <p style={{ fontSize:"15px", lineHeight:1.8, color:t.textMuted, maxWidth:"640px", margin:0 }}>{profile.bio}</p>
        </motion.section>
      )}

      {/* Skills */}
      {profile?.skills_summary?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ marginBottom: "40px" }}
        >
          <div style={s.sectionLabel}>Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.skills_summary.map((skill, i) => (
              <span
                key={i}
                style={{
                  fontSize:        "13px",
                  padding:         "6px 14px",
                  borderRadius:    "8px",
                  background:      t.surface,
                  border:          `1px solid ${t.glassBorder}`,
                  color:           t.text,
                  fontWeight:      500,
                  letterSpacing:   "0.01em",
                  transition:      "border-color 0.15s",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* Languages */}
      {profile?.languages?.length > 0 && (
        <motion.section initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.13 }} style={{ marginBottom:"40px" }}>
          <div style={s.sectionLabel}>Languages</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
            {profile.languages.map(lang => (
              <div key={lang.name || lang} style={{ ...s.card, padding:"10px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"13px", fontWeight:500, color:t.text }}>{lang.name || lang}</span>
                {lang.level && <span style={s.meta}>{lang.level}</span>}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Achievements */}
      <motion.section initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={s.sectionLabel}>Achievements & Credentials</div>
          {sortedAchs.length > 0 && <span style={s.meta}>{sortedAchs.length} total</span>}
        </div>

        {achLoading ? (
          <div style={s.cardGrid}>
            {[1,2,3].map(i => <div key={i} style={{ ...s.card, height:"140px", opacity:0.4 }} />)}
          </div>
        ) : sortedAchs.length === 0 ? (
          <div style={{ ...s.card, padding:"32px", textAlign:"center" }}>
            <p style={{ color:t.textMuted, fontSize:"14px", margin:0 }}>No achievements yet.</p>
          </div>
        ) : (
          <div style={s.cardGrid}>
            {sortedAchs.map((ach, i) => <AchCard key={ach.id || i} ach={ach} t={t} s={s} />)}
          </div>
        )}
      </motion.section>
    </div>
  )
}

function AchCard({ ach, t, s }) {
  const [hovered, setHovered] = useState(false)
  const cat = CATEGORY_COLORS[ach.category] || CATEGORY_COLORS.certification

  return (
    <motion.div
      whileHover={{ y:-2 }}
      transition={{ duration:0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => ach.credential_url && window.open(ach.credential_url, "_blank")}
      style={{
        ...s.card,
        padding:"18px 20px",
        cursor: ach.credential_url ? "pointer" : "default",
        borderColor: hovered ? t.borderHover : t.glassBorder,
        transition:"border-color 0.15s",
        position:"relative", overflow:"hidden",
      }}
    >
      {ach.is_featured && (
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"10px" }}>
        <span style={{ fontSize:"10px", fontWeight:600, padding:"2px 7px", borderRadius:"4px", background:cat.bg, color:cat.text, letterSpacing:"0.04em", textTransform:"uppercase" }}>
          {cat.label}
        </span>
        {ach.is_featured && <span style={{ fontSize:"12px", color:t.accent }}>★</span>}
      </div>{ach.image_url && <img src={ach.image_url.startsWith("http") ? ach.image_url : `http://127.0.0.1:8000${ach.image_url}`} alt={ach.issuer} style={{ width:"32px", height:"32px", objectFit:"contain", marginBottom:"10px", borderRadius:"6px" }} />}

      <div style={{ fontSize:"14px", fontWeight:600, color:t.text, marginBottom:"4px", lineHeight:1.3 }}>{ach.title}</div>
      <div style={{ fontSize:"12px", color:t.accent, marginBottom:"6px" }}>{ach.issuer}</div>
      {ach.description && <div style={{ fontSize:"12px", color:t.textMuted, lineHeight:1.6, marginBottom:"10px" }}>{ach.description.slice(0,100)}{ach.description.length > 100 ? "…" : ""}</div>}

      {ach.skills?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"10px" }}>
          {ach.skills.slice(0,4).map(skill => <span key={skill} style={{ fontSize:"10px", padding:"2px 6px", borderRadius:"4px", background:t.surface, color:t.textMuted }}>{skill}</span>)}
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {ach.issued_date && <span style={s.meta}>{formatDate(ach.issued_date)}</span>}
        {ach.credential_url && <span style={{ fontSize:"11px", color:t.accent }}>Verify ↗</span>}
      </div>
    </motion.div>
  )
}
