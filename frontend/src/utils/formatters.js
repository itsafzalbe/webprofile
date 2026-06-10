export function formatDate(dateStr) {
  if (!dateStr) return "Present"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
}

export function formatReadTime(minutes) {
  return `${minutes} min read`
}

export function formatFileSize(bytes) {
  if (!bytes) return "0B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${units[i]}`
}

/**
 * Converts an absolute path to a shell-style display path.
 *   /home/afzalbek           → ~
 *   /home/afzalbek/projects  → ~/projects
 *   /home/afzalbek/a/b/c     → ~/a/b/c
 *   /etc/nginx               → /etc/nginx   (no change outside home)
 */
export function buildPromptPath(path) {
  if (!path) return "~"
  const home = "/home/afzalbe"
  if (path === home)               return "~"
  if (path.startsWith(home + "/")) return "~/" + path.slice(home.length + 1)
  return path
}

export function truncate(text, length = 60) {
  if (!text) return ""
  return text.length > length ? text.slice(0, length) + "..." : text
}

export function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}