import client from "./client"

export const login   = (data) => client.post("/auth/login", data).then(r => r.data)
export const logout  = ()     => client.post("/auth/logout").then(r => r.data)
export const getMe   = ()     => client.get("/auth/me").then(r => r.data)
export const verify  = ()     => client.get("/auth/verify").then(r => r.data)