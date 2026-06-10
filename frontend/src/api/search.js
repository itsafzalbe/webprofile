import client from "./client"

export const search      = (q, type = "all") => client.get("/search",             { params: { q, type } }).then(r => r.data)
export const suggestions = (q, limit = 5)    => client.get("/search/suggestions", { params: { q, limit } }).then(r => r.data)