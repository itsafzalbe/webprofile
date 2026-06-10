import axios from "axios"

// Use relative URL in dev so Vite proxy handles it → no CORS.
// In production, set VITE_API_URL to your real backend origin.
const BASE = import.meta.env.VITE_API_URL || "/api/v1"

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})


// Attach session ID + optional auth token to every request
client.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("afzalbe_os_token")
    if (raw) {
      const parsed = JSON.parse(raw)
      const sessionId = parsed?.state?.sessionId
      if (sessionId) config.headers["X-Session-ID"] = sessionId
    }
  } catch {}

  const token = localStorage.getItem("afzalbe_os_token")
  if (token) config.headers["Authorization"] = `Bearer ${token}`

  return config
})

// Response interceptor — clear token on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("afzalbe_os_token")
    }
    return Promise.reject(err)
  }
)

export default client
