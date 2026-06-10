import { useEffect, useState } from "react"
import { getDashboard } from "../../api/analytics"
import { getUnreadCount } from "../../api/contact"

function StatCard({ label, value, color = "#7dcfff" }) {
  return (
    <div style={{
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      padding:      "20px 24px",
    }}>
      <div style={{ fontSize: "28px", fontWeight: 700, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {})
    getUnreadCount().then(d => setUnread(d.unread)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Dashboard</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "32px" }}>Live system overview</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        <StatCard label="Active Now"       value={stats?.active_now}       color="#9ece6a" />
        <StatCard label="Today Visitors"   value={stats?.today_visitors}   color="#7dcfff" />
        <StatCard label="Total Visitors"   value={stats?.total_visitors}   color="#bb9af7" />
        <StatCard label="Unread Messages"  value={unread}                  color="#ff9e64" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Top commands */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding:      "20px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#c0caf5", marginBottom: "16px" }}>Top Commands</div>
          {stats?.top_commands?.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
              <span style={{ color: "#7dcfff", fontFamily: "JetBrains Mono, monospace" }}>{c.command}</span>
              <span style={{ color: "#565f89" }}>{c.count}</span>
            </div>
          ))}
        </div>

        {/* Device breakdown */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding:      "20px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#c0caf5", marginBottom: "16px" }}>Devices</div>
          {stats?.devices?.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
              <span style={{ color: "#c0caf5" }}>{d.device}</span>
              <span style={{ color: "#565f89" }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}