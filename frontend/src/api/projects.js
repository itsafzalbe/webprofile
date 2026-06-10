import client from "./client"

export const getProjects     = (params) => client.get("/projects", { params }).then(r => r.data)
export const getProject      = (slug)   => client.get(`/projects/${slug}`).then(r => r.data)
export const getProjectTags  = ()       => client.get("/projects/tags").then(r => r.data)
export const adminGetAll     = ()       => client.get("/projects/admin/all").then(r => r.data)
export const createProject   = (data)   => client.post("/projects", data).then(r => r.data)
export const updateProject   = (slug, data) => client.patch(`/projects/${slug}`, data).then(r => r.data)
export const deleteProject   = (slug)   => client.delete(`/projects/${slug}`).then(r => r.data)