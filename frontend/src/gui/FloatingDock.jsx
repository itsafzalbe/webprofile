import { useState, useRef, useEffect } from "react"
import { NavLink, useNavigate }    from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeStore }           from "../store/useThemeStore"
import { useSystemStore }          from "../store/useSystemStore"
import { guiThemes }               from "./guiTheme"
import { makeStyles }              from "./guiStyles"
import { downloadResume }          from "../api/resume"

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/gui",            label: "Home",       icon: HomeIcon       },
  { to: "/gui/projects",   label: "Projects",   icon: ProjectsIcon   },
  { to: "/gui/blog",       label: "Blog",       icon: BlogIcon       },
  { to: "/gui/about",      label: "About",      icon: AboutIcon      },
  { to: "/gui/experience", label: "Experience", icon: ExperienceIcon },
  { to: "/gui/contact",    label: "Contact",    icon: ContactIcon    },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return mobile
}

export default function FloatingDock() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileDock /> : <DesktopDock />
}

// ── Desktop — top center pill with text labels + Resume button ────────────────
function DesktopDock() {
  const { guiTheme, toggleGuiTheme } = useThemeStore()
  const { switchToTerminal }          = useSystemStore()
  const t                             = guiThemes[guiTheme]
  const navigate                      = useNavigate()

  const [hovered,        setHovered]        = useState(null)
  const [indicatorStyle, setIndicatorStyle] = useState({})
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
    <div style={{
      position:  "fixed", top: "16px", left: "50%",
      transform: "translateX(-50%)", zIndex: 1000,
      display:   "flex", alignItems: "center", gap: "8px",
      // pointer-events only on children, not this invisible wrapper
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
        {/* Logo */}
        {/* Logo */}
        <div
          onClick={() => navigate("/gui")}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: t.pillActive,
            border: `1px solid ${t.glassBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "4px",
            flexShrink: 0,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.05)"
            e.currentTarget.style.opacity = "0.9"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.opacity = "1"
          }}
        >
          <img
            src={guiTheme === "dark" ? "/star_white.png" : "/star_black.png"}
            alt="logo"
            draggable={false}
            style={{
              width: "16px",
              height: "16px",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Sliding hover indicator */}
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
                transition: "left 0.15s ease, width 0.15s ease",
              }}
            />
          )}
        </AnimatePresence>

        {/* Nav links */}
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/gui"}
            ref={el => { itemRefs.current[to] = el }}
            onMouseEnter={() => { setHovered(to); updateIndicator(to) }}
            onMouseLeave={() => setHovered(null)}
            style={({ isActive }) => ({
              position: "relative", zIndex: 1,
              display: "flex", alignItems: "center",
              padding: "5px 13px", borderRadius: "40px",
              textDecoration: "none", fontSize: "13px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? t.navTextActive : t.navText,
              background: isActive ? t.pillActive : "transparent",
              transition: "color 0.15s", whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            })}
          >{label}</NavLink>
        ))}

        {/* Divider */}
        <div style={{ width:"1px", height:"18px", background:t.glassBorder, margin:"0 4px", flexShrink:0 }} />

        {/* Theme toggle */}
        <DockBtn onClick={toggleGuiTheme} title={guiTheme === "dark" ? "Light mode" : "Dark mode"} t={t}>
          {guiTheme === "dark" ? <SunIcon /> : <MoonIcon />}
        </DockBtn>

        {/* Terminal */}
        <DockBtn onClick={switchToTerminal} title="Open terminal" t={t}>
          <TerminalIcon />
        </DockBtn>
      </motion.nav>

      {/* Resume pill — separate, to the right */}
      <motion.button
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        onClick={downloadResume}
        title="Download résumé"
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "6px",
          padding:        "6px 14px",
          borderRadius:   "50px",
          background:     t.dockBg,
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          border:         `1px solid ${t.glassBorder}`,
          boxShadow:      t.dockShadow,
          cursor:         "pointer",
          color:          t.accent,
          fontSize:       "13px",
          fontWeight:     500,
          whiteSpace:     "nowrap",
          fontFamily:     "inherit",
          letterSpacing:  "-0.01em",
          transition:     "opacity 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <DownloadIcon />
        Résumé
      </motion.button>
    </div>
  )
}

// ── Mobile — bottom icon dock, scroll-safe ────────────────────────────────────
function MobileDock() {
  const { guiTheme, toggleGuiTheme } = useThemeStore()
  const { switchToTerminal }          = useSystemStore()
  const t                             = guiThemes[guiTheme]
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <>
      {/*
        Wrapper is pointer-events:none so it NEVER intercepts scrolls or touches.
        Only the pill (pointerEvents:"auto") is interactive. This was the scroll bug.
      */}
      <div style={{
        position:      "fixed",
        bottom:        0,
        left:          0,
        right:         0,
        display:       "flex",
        justifyContent:"center",
        alignItems:    "flex-end",
        padding:       "0 0 18px",
        zIndex:        1000,
        pointerEvents: "none",
      }}>
        <motion.nav
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents:       "auto",
            display:             "flex",
            alignItems:          "center",
            gap:                 "2px",
            padding:             "8px 10px",
            borderRadius:        "22px",
            background:          t.dockBg,
            backdropFilter:      "blur(24px) saturate(1.5)",
            WebkitBackdropFilter:"blur(24px) saturate(1.5)",
            border:              `1px solid ${t.glassBorder}`,
            boxShadow:           t.dockShadow,
            position:            "relative",
          }}
        >
          {/* Nav icon items */}
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <div
              key={to}
              style={{ position: "relative" }}
              onMouseEnter={() => setHoveredItem(to)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <MobileTooltip label={label} visible={hoveredItem === to} t={t} />
              <NavLink
                to={to}
                end={to === "/gui"}
                style={({ isActive }) => ({
                  width:          "40px",
                  height:         "40px",
                  borderRadius:   "13px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color:          isActive ? t.navTextActive : t.navText,
                  background:     isActive ? t.pillActive    : "transparent",
                  transition:     "background 0.15s, color 0.15s",
                })}
              >
                <Icon size={18} />
              </NavLink>
            </div>
          ))}

          {/* Divider */}
          <div style={{ width:"1px", height:"20px", background:t.glassBorder, margin:"0 3px", flexShrink:0 }} />

          {/* Resume download */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredItem("resume")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <MobileTooltip label="Résumé" visible={hoveredItem === "resume"} t={t} />
            <button
              onClick={downloadResume}
              style={{
                width:"40px", height:"40px", borderRadius:"13px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"transparent", border:"none", cursor:"pointer",
                color: t.accent,
              }}
            >
              <DownloadIcon size={17} />
            </button>
          </div>

          {/* Theme toggle */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredItem("theme")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <MobileTooltip
              label={guiTheme === "dark" ? "Light" : "Dark"}
              visible={hoveredItem === "theme"}
              t={t}
            />
            <button
              onClick={toggleGuiTheme}
              style={{
                width:"40px", height:"40px", borderRadius:"13px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"transparent", border:"none", cursor:"pointer",
                color: t.navText,
              }}
            >
              {guiTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Terminal */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredItem("terminal")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <MobileTooltip label="Terminal" visible={hoveredItem === "terminal"} t={t} />
            <button
              onClick={switchToTerminal}
              style={{
                width:"40px", height:"40px", borderRadius:"13px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"transparent", border:"none", cursor:"pointer",
                color: t.navText,
              }}
            >
              <TerminalIcon />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Spacer so page content clears the dock */}
      <div style={{ height: "84px", pointerEvents: "none", flexShrink: 0 }} aria-hidden />
    </>
  )
}

// ── Tooltip (mobile only — appears above icon) ────────────────────────────────
function MobileTooltip({ label, visible, t }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12 }}
          style={{
            position:      "absolute",
            bottom:        "calc(100% + 8px)",
            left:          "50%",
            transform:     "translateX(-50%)",
            background:    t.dockBg,
            backdropFilter:"blur(12px)",
            WebkitBackdropFilter:"blur(12px)",
            border:        `1px solid ${t.glassBorder}`,
            borderRadius:  "7px",
            padding:       "3px 9px",
            fontSize:      "11px",
            fontWeight:    500,
            color:         t.text,
            whiteSpace:    "nowrap",
            pointerEvents: "none",
            boxShadow:     t.dockShadow,
          }}
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Shared desktop dock button ────────────────────────────────────────────────
function DockBtn({ onClick, title, children, t }) {
  const [over, setOver] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      style={{
        background:"none", border:"none", cursor:"pointer",
        padding:"5px 8px", borderRadius:"8px",
        color: over ? t.navTextActive : t.navText,
        display:"flex", alignItems:"center", transition:"color 0.15s",
      }}
    >{children}</button>
  )
}

// ── Icons — accept optional size prop ────────────────────────────────────────
function HomeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  )
}
function ProjectsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function BlogIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
  )
}
function AboutIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  )
}
function ExperienceIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  )
}
function ContactIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function TerminalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  )
}
function DownloadIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}