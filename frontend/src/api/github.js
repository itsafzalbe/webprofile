import client from "./client"

export const getGithubProfile     = ()       => client.get("/github/profile").then(r => r.data)
export const getGithubRepos       = (params) => client.get("/github/repos", { params }).then(r => r.data)
export const getPinnedRepos       = ()       => client.get("/github/pinned").then(r => r.data)
export const getContributions     = ()       => client.get("/github/contributions").then(r => r.data)