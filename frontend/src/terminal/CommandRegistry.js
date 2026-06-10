import help         from "./commands/help"
import whoami       from "./commands/whoami"
import about        from "./commands/about"
import skills       from "./commands/skills"
import projects     from "./commands/projects"
import blog         from "./commands/blog"
import experience   from "./commands/experience"
import resume       from "./commands/resume"
import search       from "./commands/search"
import open         from "./commands/open"
import ls           from "./commands/ls"
import cd           from "./commands/cd"
import cat          from "./commands/cat"
import tree         from "./commands/tree"
import pwd          from "./commands/pwd"
import echo         from "./commands/echo"
import clear        from "./commands/clear"
import history      from "./commands/history"
import theme        from "./commands/theme"
import gui          from "./commands/gui"
import now          from "./commands/now"
import timeline     from "./commands/timeline"
import contact      from "./commands/contact"
import achievements from "./commands/achievements"
import { sudoHire, rmRfBugs, kernelPanic } from "./commands/easter_eggs"

const registry = {
  help,
  whoami,
  about,
  skills,
  projects,
  blog,
  experience,
  resume,
  search,
  open,
  ls,
  cd,
  cat,
  tree,
  pwd,
  echo,
  clear,
  history,
  theme,
  gui,
  now,
  timeline,
  contact,
  achievements,

  sudo: async ({ parsed, addOutput, theme: t, unlock }) => {
    const sub = parsed.args.join(" ")
    if (sub === "hire afzalbek") return sudoHire({ addOutput, theme: t, unlock })
    if (sub === "admin dash") {
      addOutput({ type: "muted", text: "  Redirecting to admin panel..." })
      setTimeout(() => window.location.href = "/admin/login", 800)
      return
    }
    addOutput({ type: "error", text: `sudo: ${parsed.args[0]}: command not found` })
  },

  rm: async ({ parsed, addOutput }) => {
    if (parsed.flags.rf === true || parsed.args.includes("-rf") || parsed.args.includes("-r")) {
      const target = parsed.positional[0]
      if (target === "bugs") return rmRfBugs({ addOutput })
    }
    addOutput({ type: "error", text: "rm: permission denied (this is a read-only filesystem)" })
  },

  kernel: async ({ parsed, addOutput }) => {
    if (parsed.positional[0] === "panic") return kernelPanic({ addOutput })
    addOutput({ type: "error", text: `kernel: unknown subcommand '${parsed.positional[0]}'` })
  },

  login: async ({ parsed, addOutput, theme: t }) => {
    if (parsed.flags.root !== undefined || parsed.positional[0] === "--root") {
      addOutput({ type: "muted",   text: "  Redirecting to admin panel..." })
      setTimeout(() => window.location.href = "/admin/login", 800)
    } else {
      addOutput({ type: "error", text: "login: unknown flag. Try 'login --root'." })
    }
    addOutput({ type: "empty" })
  },
}

export function getRegistry() {
  return registry
}
