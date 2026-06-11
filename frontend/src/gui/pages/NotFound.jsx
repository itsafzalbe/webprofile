import { Link }            from "react-router-dom"
import { motion }          from "framer-motion"
import { useThemeStore }   from "../../store/useThemeStore"
import { guiThemes }       from "../guiTheme"
import { makeStyles }      from "../guiStyles"

export default function NotFound() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  return (
    <div style={{ ...s.pageNarrow, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", textAlign:"center" }}>
      <motion.div
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
      >
        {/* Glitchy 404 number */}
        <div style={{
          fontSize:"clamp(80px,18vw,140px)", fontWeight:800,
          letterSpacing:"-0.05em", lineHeight:1,
          color: t.accent, opacity:0.18,
          marginBottom:"8px", userSelect:"none",
          fontFamily:"-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif",
        }}>
          404
        </div>

        <h1 style={{ ...s.pageTitle, marginBottom:"8px" }}>Page not found</h1>
        <p style={{ fontSize:"14px", color:t.textMuted, marginBottom:"36px", lineHeight:1.6 }}>
          The path you followed doesn't exist — it may have moved or never existed.
        </p>

        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <Link
            to="/gui"
            style={{ ...s.btnPrimary, textDecoration:"none", display:"inline-block" }}
          >
            ← Back to home
          </Link>
          <Link
            to="/gui/projects"
            style={{ ...s.btnSecondary, textDecoration:"none", display:"inline-block" }}
          >
            View projects
          </Link>
        </div>

        {/* subtle terminal hint */}
        <p style={{ fontSize:"11px", color:t.textFaint, marginTop:"48px", fontFamily:"JetBrains Mono, monospace" }}>
          or switch to <Link to="/" style={{ color:t.accent, textDecoration:"none" }}>terminal mode</Link> if you know your way around
        </p>
      </motion.div>
    </div>
  )
}