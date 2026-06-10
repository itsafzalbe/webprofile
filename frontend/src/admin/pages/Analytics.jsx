import { useEffect, useState } from "react"
import { getDashboard } from "../../api/analytics"

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then(setData).catch(() => {})
  }, [])

  const Section = ({ title, children }) => (
    <div style={{
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      padding:      "20px",
      marginBottom: "16px",
    }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#c0caf5", marginBottom: "16px" }}>{title}</div>
      {children}
    </div>
  )

  const Row = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: "#c0caf5" }}>{value}</span>
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5", marginBottom: "8px" }}>Analytics</h1>
      <p style={{ fontSize: "13px", color: "#565f89", marginBottom: "24px" }}>Visitor and usage statistics</p>

      {!data ? (
        <div style={{ color: "#565f89", fontSize: "13px" }}>Loading analytics...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <Section title="Overview">
              <Row label="Active Now"       value={data.active_now} />
              <Row label="Today"            value={data.today_visitors} />
              <Row label="Total Visitors"   value={data.total_visitors} />
              <Row label="Total Commands"   value={data.total_commands} />
              <Row label="Commands Today"   value={data.commands_today} />
            </Section>

            <Section title="Browsers">
              {data.browsers?.map((b, i) => <Row key={i} label={b.browser} value={b.count} />)}
            </Section>
          </div>

          <div>
            <Section title="Top Commands">
              {data.top_commands?.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                  <span style={{ color: "#7dcfff", fontFamily: "JetBrains Mono, monospace" }}>{c.command}</span>
                  <span style={{ color: "#565f89" }}>{c.count}</span>
                </div>
              ))}
            </Section>

            <Section title="OS Breakdown">
              {data.os_breakdown?.map((o, i) => <Row key={i} label={o.os} value={o.count} />)}
            </Section>

            <Section title="Devices">
              {data.devices?.map((d, i) => <Row key={i} label={d.device} value={d.count} />)}
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}