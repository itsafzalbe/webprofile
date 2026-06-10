export const API_URL  = import.meta.env.VITE_API_URL  || "http://localhost:8000/api/v1"
export const WS_URL   = import.meta.env.VITE_WS_URL   || "ws://localhost:8000/api/v1"

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

export const BOOT_STORAGE_KEY   = "afzalbe_os_booted"
export const SESSION_STORAGE_KEY = "afzalbe_os_session"
export const THEME_STORAGE_KEY   = "afzalbe_os_theme"
export const ACHIEVEMENTS_STORAGE_KEY = "afzalbe_os_achievements"