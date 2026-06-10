import client from "./client"

export const getExperience = (type) => client.get("/experience", { params: type ? { type } : {} }).then(r => r.data)