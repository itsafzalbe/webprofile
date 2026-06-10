import client from "./client"

export const getProfile     = ()     => client.get("/profile").then(r => r.data)
export const getWhoami      = ()     => client.get("/profile/whoami").then(r => r.data)
export const updateProfile  = (data) => client.patch("/profile", data).then(r => r.data)
export const createProfile  = (data) => client.post("/profile", data).then(r => r.data)