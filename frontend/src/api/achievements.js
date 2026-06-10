import client from "./client"

export const getAchievements   = ()    => client.get("/achievements").then(r => r.data)
export const unlockAchievement = (key) => client.post(`/achievements/${key}/unlock`).then(r => r.data)