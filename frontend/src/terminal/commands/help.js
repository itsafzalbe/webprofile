const commands = [
  { name: "help",         desc: "bro confused already [>_<]" },
  { name: "whoami",       desc: "the main character fr" },
  { name: "about",        desc: "lil background check" },
  { name: "projects",     desc: "cool shi i built" },
  { name: "blog",         desc: "random thoughts n rants" },
  { name: "skills",       desc: "locked in tech stack" },
  { name: "experience",   desc: "academic comeback arc" },
  { name: "contact",      desc: "tap in twin" },
  { name: "resume",       desc: "the receipts" },
  { name: "search",       desc: "find yo shi rq" },
  { name: "open",         desc: "leave the matrix" },
  { name: "ls",           desc: "what we got here" },
  { name: "cd",           desc: "teleport rq" },
  { name: "cat",          desc: "read the forbidden texts" },
  { name: "tree",         desc: "whole lore structure" },
  { name: "pwd",          desc: "u standing here gang" },
  { name: "echo",         desc: "say it w confidence" },
  { name: "clear",        desc: "memory wipe" },
  { name: "history",      desc: "receipts don't lie" },
  { name: "theme",        desc: "switch the aura" },
  { name: "gui",          desc: "touch grass mode" },
  { name: "achievements", desc: "side quests completed" },
  { name: "now",          desc: "current timeline status" },
  { name: "timeline",     desc: "character development arc" },
]

export default async function help({ addOutput, theme }) {
  addOutput({ type: "accent", text: "AVZALBEK OS — Available Commands" })
  addOutput({ type: "muted",  text: "─".repeat(50) })
  addOutput({ type: "empty" })

  commands.forEach(({ name, desc }) => {
    addOutput({
      type: "text",
      html: `<span style="color:${theme.user}">${name.padEnd(30, ".")}</span><span style="color:${theme.muted}">${desc}</span>`,
    })
  })

  addOutput({ type: "empty" })
  addOutput({ type: "muted", text: "Hint: lowkey hidden shi everywhere if u look close enough" })
  addOutput({ type: "empty" })
}
