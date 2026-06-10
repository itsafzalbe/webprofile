import client from "./client"
import { API_URL } from "../utils/constants"

export const getResumeInfo  = ()  => client.get("/resume/info").then(r => r.data)
export const downloadResume = ()  => {
  window.open(`${API_URL}/resume/download`, "_blank")
}