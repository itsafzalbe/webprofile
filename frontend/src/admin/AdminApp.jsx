import { Routes, Route, Navigate } from "react-router-dom"
import { useAdminStore } from "../store/useAdminStore"
import AdminLogin  from "./AdminLogin"
import AdminLayout from "./AdminLayout"
import Dashboard   from "./pages/Dashboard"
import Projects    from "./pages/Projects"
import Blog        from "./pages/Blog"
import BlogEditor  from "./pages/BlogEditor"
import Messages    from "./pages/Messages"
import Analytics   from "./pages/Analytics"
import Experience  from "./pages/Experience"
import Profile     from "./pages/Profile"
import Filesystem  from "./pages/Filesystem"

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminStore()
  return isAuthenticated() ? children : <Navigate to="/admin/login" replace />
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin onSuccess={() => window.location.replace("/admin")} />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index              element={<Dashboard />} />
                <Route path="projects"    element={<Projects />} />
                <Route path="blog"        element={<Blog />} />
                <Route path="blog/new"    element={<BlogEditor />} />
                <Route path="blog/:slug"  element={<BlogEditor />} />
                <Route path="messages"    element={<Messages />} />
                <Route path="analytics"   element={<Analytics />} />
                <Route path="experience"  element={<Experience />} />
                <Route path="profile"     element={<Profile />} />
                <Route path="filesystem"  element={<Filesystem />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}