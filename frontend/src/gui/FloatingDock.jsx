import { useState, useRef }           from "react"
import { NavLink, useNavigate }        from "react-router-dom"
import { motion, AnimatePresence }     from "framer-motion"
import { useThemeStore }               from "../store/useThemeStore"
import { useSystemStore }              from "../store/useSystemStore"
import { guiThemes }                   from "./guiTheme"
import { makeStyles }                  from "./guiStyles"

const NAV_ITEMS = [
  { to: "/gui",            label: "Home",       key: "home"       },
  { to: "/gui/projects",   label: "Projects",   key: "projects"   },
  { to: "/gui/blog",       label: "Blog",       key: "blog"       },
  { to: "/gui/about",      label: "About",      key: "about"      },
  { to: "/gui/experience", label: "Experience", key: "experience" },
  { to: "/gui/contact",    label: "Contact",    key: "contact"    },
]

export default function FloatingDock() {
  const { guiTheme, toggleGuiTheme } = useThemeStore()
  const { switchToTerminal }          = useSystemStore()
  const t                             = guiThemes[guiTheme]
  const s                             = makeStyles(t)
  const navigate                      = useNavigate()

  const [hovered,        setHovered]        = useState(null)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [adminOpen,      setAdminOpen]      = useState(false)
  const navRef   = useRef(null)
  const itemRefs = useRef({})

  const updateIndicator = (key) => {
    const el  = itemRefs.current[key]
    const nav = navRef.current
    if (!el || !nav) return
    const er = el.getBoundingClientRect()
    const nr = nav.getBoundingClientRect()
    setIndicatorStyle({ left: er.left - nr.left, width: er.width })
  }

  return (
    <>
      <div style={{
        position:  "fixed", top: "16px", left: "50%",
        transform: "translateX(-50%)", zIndex: 1000,
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        {/* Nav pill */}
        <motion.nav
          ref={navRef}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display:             "flex",
            alignItems:          "center",
            gap:                 "2px",
            padding:             "5px 6px",
            borderRadius:        "50px",
            background:          t.dockBg,
            backdropFilter:      "blur(20px) saturate(1.4)",
            WebkitBackdropFilter:"blur(20px) saturate(1.4)",
            border:              `1px solid ${t.glassBorder}`,
            boxShadow:           t.dockShadow,
            position:            "relative",
          }}
        >
          {/* Logo dot */}
          <div
            onClick={() => navigate("/gui")}
            style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: t.accent, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "10px", fontWeight: 800,
              color: guiTheme === "dark" ? "#000" : "#fff",
              marginRight: "4px", flexShrink: 0, cursor: "pointer",
            }}
          >A</div>

          {/* Hover indicator */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key="ind"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "absolute", top: "5px", bottom: "5px",
                  borderRadius: "40px", background: t.pillHover,
                  pointerEvents: "none", ...indicatorStyle,
                }}
              />
            )}
          </AnimatePresence>

          {NAV_ITEMS.map(({ to, label, key }) => (
            <NavLink
              key={key}
              to={to}
              end={to === "/gui"}
              ref={el => { itemRefs.current[key] = el }}
              onMouseEnter={() => { setHovered(key); updateIndicator(key) }}
              onMouseLeave={() => setHovered(null)}
              style={({ isActive }) => ({
                position: "relative", zIndex: 1,
                display: "flex", alignItems: "center",
                padding: "5px 13px", borderRadius: "40px",
                textDecoration: "none", fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? t.navTextActive : t.navText,
                background: isActive ? t.pillActive : "transparent",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              })}
            >{label}</NavLink>
          ))}

          <div style={{ width: "1px", height: "18px", background: t.glassBorder, margin: "0 4px", flexShrink: 0 }} />

          <DockBtn onClick={toggleGuiTheme} title={guiTheme === "dark" ? "Light mode" : "Dark mode"} t={t}>
            {guiTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </DockBtn>
          <DockBtn onClick={switchToTerminal} title="Back to terminal" t={t}>
            <TerminalIcon />
          </DockBtn>
        </motion.nav>

        {/* Admin button */}
        {/* <motion.button
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setAdminOpen(v => !v)}
          style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: t.dockBg, backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${t.glassBorder}`, boxShadow: t.dockShadow,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: adminOpen ? t.accent : t.navText,
            transition: "color 0.15s",
          }}
        ><AdminIcon /></motion.button> */}
      </div>

      <AnimatePresence>
        {adminOpen && <AdminPanel t={t} s={s} onClose={() => setAdminOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

function AdminPanel({ t, s, onClose }) {
  const [user, setUser]         = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/v1/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
      })
      if (!res.ok) throw new Error("Invalid credentials")
      const data = await res.json()
      if (data.access_token) {
        localStorage.setItem("afzalbe_os_token", data.access_token)
        onClose()
      }
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed", top: "62px", right: "16px", zIndex: 999,
        width: "260px", background: t.dockBg,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${t.glassBorder}`, boxShadow: t.dockShadow,
        borderRadius: "16px", padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>Admin Login</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>System access</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "18px", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input placeholder="Username" value={user} onChange={e => setUser(e.target.value)} style={s.input} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={s.input}
        />
        {error && <div style={{ fontSize: "11px", color: t.error }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </motion.div>
  )
}

function DockBtn({ onClick, title, children, t }) {
  const [over, setOver] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "5px 8px", borderRadius: "8px",
        color: over ? t.navTextActive : t.navText,
        display: "flex", alignItems: "center", transition: "color 0.15s",
      }}
    >{children}</button>
  )
}

const SunIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const MoonIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const TerminalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
const AdminIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
