import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion }     from "framer-motion"
import { useThemeStore } from "../store/useThemeStore";
import { guiThemes }                   from "./guiTheme"
import FloatingDock                    from "./FloatingDock"
import Home          from "./pages/Home"
import Projects      from "./pages/Projects"
import ProjectDetail from "./pages/ProjectDetail"
import Blog          from "./pages/Blog"
import BlogPost      from "./pages/BlogPost"
import About         from "./pages/About"
import Experience    from "./pages/Experience"
import Contact       from "./pages/Contact"

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14 } },
}

export default function GUILayout() {
  const { guiTheme } = useThemeStore()
  const t            = guiThemes[guiTheme]
  const location     = useLocation()

  return (
    <div style={{
      minHeight:       "100vh",
      backgroundColor: t.bg,
      color:           t.text,
      fontFamily:      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, 'Helvetica Neue', sans-serif",
      transition:      "background 0.25s, color 0.25s",
    }}>
      {/* Floating dock — always on top */}
      <FloatingDock />

      {/* Page content — padded below dock */}
      <main style={{ paddingTop: "72px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Routes location={location}>
              <Route path="/gui"                element={<Home />}          />
              <Route path="/gui/projects"       element={<Projects />}      />
              <Route path="/gui/projects/:slug" element={<ProjectDetail />} />
              <Route path="/gui/blog"           element={<Blog />}          />
              <Route path="/gui/blog/:slug"     element={<BlogPost />}      />
              <Route path="/gui/about"          element={<About />}         />
              <Route path="/gui/experience"     element={<Experience />}    />
              <Route path="/gui/contact"        element={<Contact />}       />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
