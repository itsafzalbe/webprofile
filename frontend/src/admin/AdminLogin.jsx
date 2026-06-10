import { useState } from "react"
import { motion } from "framer-motion"
import { useAdminStore } from "../store/useAdminStore"
import { login } from "../api/auth"

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAdminStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await login({ username, password })
      setAuth(data.access_token, { username })
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
        style={{
          background:      "rgba(255,255,255,0.04)",
          backdropFilter:  "blur(12px)",
          border:          "1px solid rgba(255,255,255,0.08)",
          borderRadius:    "16px",
          padding:         "40px",
          fontFamily:      "JetBrains Mono, monospace",
        }}
      >
        <div className="mb-8">
          <div className="text-xs mb-1" style={{ color: "#565f89" }}>AFZALBE OS</div>
          <div className="text-lg font-semibold" style={{ color: "#c0caf5" }}>Admin Access</div>
          <div className="text-xs mt-1" style={{ color: "#565f89" }}>Hidden system panel</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#565f89" }}>USERNAME</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent outline-none text-sm px-3 py-2 rounded"
              style={{
                border:     "1px solid rgba(255,255,255,0.1)",
                color:      "#c0caf5",
                fontFamily: "JetBrains Mono, monospace",
                fontSize:   "13px",
              }}
            />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "#565f89" }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-sm px-3 py-2 rounded"
              style={{
                border:     "1px solid rgba(255,255,255,0.1)",
                color:      "#c0caf5",
                fontFamily: "JetBrains Mono, monospace",
                fontSize:   "13px",
              }}
            />
          </div>

          {error && (
            <div className="text-xs" style={{ color: "#f7768e" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-sm font-medium mt-2 transition-opacity"
            style={{
              backgroundColor: "#7dcfff22",
              border:          "1px solid #7dcfff44",
              color:           "#7dcfff",
              fontFamily:      "JetBrains Mono, monospace",
              opacity:         loading ? 0.5 : 1,
              cursor:          loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Authenticating..." : "→ Login"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}