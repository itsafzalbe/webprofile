import client from "./client"

export const trackSession    = ()                     => client.post("/analytics/session").then(r => r.data)
export const trackCommand    = (command, args = null) => client.post("/analytics/command", null, { params: { command, args } }).then(r => r.data)
export const getDashboard    = ()                     => client.get("/analytics/dashboard").then(r => r.data)
export const getRealtimeStats = ()                    => client.get("/analytics/realtime").then(r => r.data)
export const getActiveUsers  = ()                     => client.get("/analytics/active-users").then(r => r.data)