import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAdminStore } from "../store/useAdminStore"
import { useSystemStore } from "../store/useSystemStore"
import { logout } from "../api/auth"
import { motion } from "framer-motion"

const NAV = [
  { path: "/admin",             label: "Dashboard",  icon: "◈" },
  { path: "/admin/projects",    label: "Projects",   icon: "◉" },
  { path: "/admin/blog",        label: "Blog",       icon: "◎" },
  { path: "/admin/messages",    label: "Messages",   icon: "◌" },
  { path: "/admin/analytics",   label: "Analytics",  icon: "◍" },
  { path: "/admin/experience",  label: "Experience", icon: "◐" },
  { path: "/admin/profile",     label: "Profile",    icon: "◑" },
  { path: "/admin/filesystem",  label: "Filesystem", icon: "◒" },
]

export default function AdminLayout({ children }) {
  const { clearAuth }      = useAdminStore()
  const { switchToTerminal } = useSystemStore()
  const navigate           = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate("/")
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif" }}
    >
      {/* Sidebar */}
      <div
        style={{
          width:           "220px",
          flexShrink:      0,
          background:      "rgba(255,255,255,0.03)",
          borderRight:     "1px solid rgba(255,255,255,0.06)",
          display:         "flex",
          flexDirection:   "column",
          padding:         "24px 0",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#565f89", letterSpacing: "0.1em" }}>AFZALBE OS</div>
          <div style={{ fontSize: "13px", color: "#c0caf5", fontWeight: 600, marginTop: "2px" }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              style={({ isActive }) => ({
                display:        "flex",
                alignItems:     "center",
                gap:            "10px",
                padding:        "8px 12px",
                borderRadius:   "8px",
                fontSize:       "13px",
                textDecoration: "none",
                color:          isActive ? "#7dcfff" : "#888",
                background:     isActive ? "rgba(125,207,255,0.08)" : "transparent",
                transition:     "all 0.15s",
              })}
            >
              <span style={{ fontSize: "12px" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <button
            onClick={() => { switchToTerminal(); navigate("/") }}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "10px",
              padding:      "8px 12px",
              borderRadius: "8px",
              fontSize:     "13px",
              color:        "#888",
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              width:        "100%",
              textAlign:    "left",
            }}
          >
            <span>⌨</span> Terminal
          </button>

          <button
            onClick={handleLogout}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "10px",
              padding:      "8px 12px",
              borderRadius: "8px",
              fontSize:     "13px",
              color:        "#f7768e",
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              width:        "100%",
              textAlign:    "left",
            }}
          >
            <span>⏻</span> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}