import client from "./client"

export const sendMessage     = (data)  => client.post("/contact", data).then(r => r.data)
export const getMessages     = (params) => client.get("/contact", { params }).then(r => r.data)
export const getMessage      = (id)    => client.get(`/contact/${id}`).then(r => r.data)
export const markRead        = (id)    => client.patch(`/contact/${id}/read`).then(r => r.data)
export const markSpam        = (id)    => client.patch(`/contact/${id}/spam`).then(r => r.data)
export const deleteMessage   = (id)    => client.delete(`/contact/${id}`).then(r => r.data)
export const getUnreadCount  = ()      => client.get("/contact/unread-count").then(r => r.data)