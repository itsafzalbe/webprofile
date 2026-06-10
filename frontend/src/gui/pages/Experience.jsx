import { useEffect, useState } from "react"
import { motion }              from "framer-motion"
import { useThemeStore }       from "../../store/useThemeStore"
import { guiThemes }           from "../guiTheme"
import { makeStyles }          from "../guiStyles"
import { getExperience }       from "../../api/experience"
import { formatDate }          from "../../utils/formatters"

export default function Experience() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [items,   setItems]   = useState([])
  const [tab,     setTab]     = useState("work")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExperience({ type: tab })
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab])

  const handleTab = (t) => { setLoading(true); setTab(t) }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Experience</h1>
      <p style={s.pageSubtitle}>Work history and education.</p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"36px" }}>
        {["work","education"].map(type => (
          <button key={type} onClick={() => handleTab(type)} style={s.filterPill(tab === type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {[1,2,3].map(i => <div key={i} style={{ ...s.card, height:"100px", opacity:0.4 }} />)}
        </div>
      ) : items.length === 0 ? (
        <p style={{ color:t.textMuted, fontSize:"14px" }}>No {tab} entries yet.</p>
      ) : (
        <div style={{ position:"relative" }}>
          {/* Timeline line */}
          <div style={{
            position:"absolute", left:"19px", top:"8px", bottom:"8px",
            width:"1px", background:t.border,
          }} />

          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {items.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity:0, x:-8 }}
                animate={{ opacity:1, x:0 }}
                transition={{ duration:0.25, delay:i * 0.05 }}
                style={{ display:"flex", gap:"20px", alignItems:"flex-start" }}
              >
                {/* Dot */}
                <div style={{
                  width:"10px", height:"10px", borderRadius:"50%",
                  background:t.accent, border:`2px solid ${t.bg}`,
                  flexShrink:0, marginTop:"18px", position:"relative", zIndex:1,
                  boxShadow:`0 0 0 3px ${t.accentSoft}`,
                }} />

                {/* Card */}
                <div style={{ ...s.card, flex:1, padding:"20px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"8px", marginBottom:"6px" }}>
                    <div>
                      <div style={{ fontSize:"15px", fontWeight:600, color:t.text }}>{item.title || item.role}</div>
                      <div style={{ fontSize:"13px", color:t.accent, marginTop:"2px" }}>{item.organization || item.company}</div>
                    </div>
                    <span style={{ ...s.meta, whiteSpace:"nowrap" }}>
                      {formatDate(item.start_date)} — {formatDate(item.end_date)}
                    </span>
                  </div>

                  {item.location && <div style={{ ...s.meta, marginBottom:"10px" }}>📍 {item.location}</div>}

                  {item.description && (
                    <p style={{ fontSize:"13px", color:t.textMuted, lineHeight:1.7, margin:"0 0 12px" }}>{item.description}</p>
                  )}

                  {item.highlights?.length > 0 && (
                    <ul style={{ margin:0, padding:"0 0 0 16px" }}>
                      {item.highlights.map((h, j) => (
                        <li key={j} style={{ fontSize:"12px", color:t.textMuted, lineHeight:1.7, marginBottom:"2px" }}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {item.skills?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginTop:"12px" }}>
                      {item.skills.map(skill => <span key={skill} style={s.tag}>{skill}</span>)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
