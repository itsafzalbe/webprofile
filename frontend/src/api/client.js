import axios from "axios"

// Relative URL → Vite dev proxy handles it (no CORS).
// In production, set VITE_API_URL to your real backend origin.
const BASE = import.meta.env.VITE_API_URL || "/api/v1"

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

// Token key — single source of truth, matches useAdminStore
const TOKEN_KEY = "afzalbe_os_token"

// Attach auth token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Clear token on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
    }
    return Promise.reject(err)
  }
)

export default client