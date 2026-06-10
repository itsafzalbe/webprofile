import client from "./client"

export const getHealth = () => client.get("/system/health").then(r => r.data)