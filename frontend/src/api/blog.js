import client from "./client"

export const getPosts       = (params) => client.get("/blog", { params }).then(r => r.data)
export const getPost        = (slug)   => client.get(`/blog/${slug}`).then(r => r.data)
export const getRelated     = (slug)   => client.get(`/blog/${slug}/related`).then(r => r.data)
export const getBlogTags    = ()       => client.get("/blog/tags").then(r => r.data)
export const getCategories  = ()       => client.get("/blog/categories").then(r => r.data)
export const adminGetAll    = (params) => client.get("/blog/admin/all", { params }).then(r => r.data)
export const createPost     = (data)   => client.post("/blog", data).then(r => r.data)
export const updatePost     = (slug, data) => client.patch(`/blog/${slug}`, data).then(r => r.data)
export const deletePost     = (slug)   => client.delete(`/blog/${slug}`).then(r => r.data)
export const publishPost    = (slug)   => client.post(`/blog/${slug}/publish`).then(r => r.data)
export const unpublishPost  = (slug)   => client.post(`/blog/${slug}/unpublish`).then(r => r.data)