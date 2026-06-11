import { useEffect }        from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSystemStore }  from "./store/useSystemStore"
import { useThemeStore }   from "./store/useThemeStore"
import { themes }          from "./themes/themes"
import BootSequence        from "./boot/BootSequence"
import Terminal            from "./terminal/Terminal"
import GUILayout           from "./gui/GUILayout"
import AdminApp            from "./admin/AdminApp"
import AchievementToast    from "./components/AchievementToast"

export default function App() {
  const { bootComplete, mode } = useSystemStore()
  const { terminalTheme }      = useThemeStore()
  const theme                  = themes[terminalTheme]
  const navigate               = useNavigate()
  const location               = useLocation()

  // Sync mode → URL (never touch /admin routes)
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return
    if (mode === "gui" && !location.pathname.startsWith("/gui")) {
      navigate("/gui", { replace: true })
    }
    if (mode === "terminal" && location.pathname.startsWith("/gui")) {
      navigate("/", { replace: true })
    }
  }, [mode]) // eslint-disable-line

  // Admin routes — bypass everything
  if (location.pathname.startsWith("/admin")) {
    return <AdminApp />
  }

  // GUI mode — default landing, no boot needed
  if (mode === "gui") {
    return (
      <div style={{ width: "100vw", minHeight: "100vh", overflowY: "auto", overflowX: "hidden" }}>
        <GUILayout />
        <AchievementToast />
      </div>
    )
  }

  // Terminal mode — opt-in, shows boot sequence on first visit
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
      {!bootComplete && <BootSequence />}

      {bootComplete && (
        <div style={{
          width:          "100%",
          height:         "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "24px",
          boxSizing:      "border-box",
        }}>
          <Terminal />
        </div>
      )}

      <AchievementToast />
    </div>
  )
}