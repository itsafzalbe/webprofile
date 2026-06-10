import { useEffect }                        from "react"
import { useNavigate, useLocation, Routes, Route } from "react-router-dom"
import { useSystemStore }                   from "./store/useSystemStore"
import { useThemeStore }                    from "./store/useThemeStore"
import { themes }                           from "./themes/themes"
import BootSequence                         from "./boot/BootSequence"
import Terminal                             from "./terminal/Terminal"
import GUILayout                            from "./gui/GUILayout"
import AdminApp                             from "./admin/AdminApp"
import AchievementToast                     from "./components/AchievementToast"

export default function App() {
  const { bootComplete, mode } = useSystemStore()
  const { terminalTheme }      = useThemeStore()
  const theme                  = themes[terminalTheme]
  const navigate               = useNavigate()
  const location               = useLocation()

  useEffect(() => {
    if (mode === "gui" && !location.pathname.startsWith("/gui")) {
      navigate("/gui", { replace: true })
    }
    if (mode === "terminal" && location.pathname.startsWith("/gui")) {
      navigate("/", { replace: true })
    }
  }, [mode])

  // Admin routes — completely bypass portfolio
  if (location.pathname.startsWith("/admin")) {
    return <AdminApp />
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>

      {!bootComplete && <BootSequence />}

      {bootComplete && mode === "terminal" && (
        <div
          style={{
            width:          "100%",
            height:         "100%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "24px",
            boxSizing:      "border-box",
          }}
        >
          <Terminal />
        </div>
      )}

      {bootComplete && mode === "gui" && (
        <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
          <GUILayout />
        </div>
      )}

      <AchievementToast />
    </div>
  )
}