export async function sudoHire({ addOutput }) {
  addOutput({ type: "success", text: "  [sudo] recruiter locked in" })
  addOutput({ type: "empty" })
  addOutput({ type: "accent",  text: "  nah hire this mf immediately [>_<]" })
  addOutput({ type: "success", text: "  employment status: WE UP" })
  addOutput({ type: "muted",   text: "  bro escaped unemployment arc" })
  addOutput({ type: "empty" })
}

export async function rmRfBugs({ addOutput }) {
  addOutput({ type: "warning", text: "  entering bug dungeon..." })
  addOutput({ type: "muted",   text: "  deleting goofy ahh bug..." })
  addOutput({ type: "muted",   text: "  deleting code from the tutorial era..." })
  addOutput({ type: "muted",   text: "  deleting 'idk why this works'..." })
  addOutput({ type: "muted",   text: "  deleting opps from production..." })
  addOutput({ type: "success", text: "  codebase lookin majestic now [^_^]" })
  addOutput({ type: "empty" })
}

export async function kernelPanic({ addOutput }) {
  const lines = [
    "  [ 0.000 ] nah who deployed this [>_<]",
    "  [ 0.001 ] production fighting for its life rn",
    "  [ 0.002 ] stack trace long as hell",
    "  [ 0.003 ] aura levels critically low",
    "",
    "  somehow we still alive tho",
    "",
  ]

  for (const line of lines) {
    addOutput({ type: line === "" ? "empty" : "error", text: line })
    await new Promise(r => setTimeout(r, 120))
  }

  addOutput({ type: "success", text: "  system stabilized • we so back"  })
  addOutput({ type: "empty" })
}
