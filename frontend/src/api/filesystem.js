import client from "./client"

export const ls   = (path, hidden = false)           => client.get("/filesystem/ls",   { params: { path, hidden } }).then(r => r.data)
export const cd   = (current, target)                => client.get("/filesystem/cd",   { params: { current, target } }).then(r => r.data)
export const cat  = (path, current)                  => client.get("/filesystem/cat",  { params: { path, current } }).then(r => r.data)
export const tree = (path, maxDepth = 3)             => client.get("/filesystem/tree", { params: { path, max_depth: maxDepth } }).then(r => r.data)
export const pwd  = (path)                           => client.get("/filesystem/pwd",  { params: { path } }).then(r => r.data)
export const getNode = (path)                        => client.get("/filesystem/node", { params: { path } }).then(r => r.data)