// In dev, leave this unset — the Vite proxy forwards /api/* to localhost:8000.
// In production, set VITE_API_URL=https://yourdomain.com/api/v1
export const API_URL = import.meta.env.VITE_API_URL || "/api/v1"
export const WS_URL  = import.meta.env.VITE_WS_URL  || `ws://${window.location.host}/api/v1`

export const HOME_PATH = "/home/afzalbek"

export const SOCIAL_PLATFORMS = {
  github:   "GitHub",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  chess:    "Chess.com",
  leetcode: "LeetCode",
}

export const ACHIEVEMENT_KEYS = {
  EXPLORER:          "explorer",
  HELP_SEEKER:       "help_seeker",
  ABOUT_READ:        "about_read",
  PROJECTS_VIEWED:   "projects_viewed",
  RESUME_DOWNLOADED: "resume_downloaded",
  CONTACT_SENT:      "contact_sent",
  GUI_SWITCHED:      "gui_switched",
  THEME_CHANGED:     "theme_changed",
  HIDDEN_DIR:        "hidden_dir",
  SUDO_HIRE:         "sudo_hire",
  RM_RF_BUGS:        "rm_rf_bugs",
  KERNEL_PANIC:      "kernel_panic",
  ALL_COMMANDS:      "all_commands",
}

// localStorage / sessionStorage keys — one place, no more typos
export const TOKEN_KEY             = "afzalbe_os_token"
export const BOOT_STORAGE_KEY      = "afzalbe_os_booted"
export const SESSION_STORAGE_KEY   = "afzalbe_os_session"
export const THEME_STORAGE_KEY     = "afzalbe_os_theme"
export const ACHIEVEMENTS_STORAGE_KEY = "afzalbe_os_achievements"