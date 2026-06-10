export default async function contact({ addOutput, theme }) {
  addOutput({ type: "accent", text: "── Tap In ───────────────────────────────" })

  addOutput({ type: "empty" })

  addOutput({
    type: "muted",
    text: "lowkey easiest way to reach me fr"
  })

  addOutput({ type: "empty" })

  addOutput({
    type: "text",
    html: `<span style="color:${theme.user}">email</span><span style="color:${theme.muted}"> → run 'about' n grab it</span>`,
  })

  addOutput({
  type: "text",
  html: `<span style="color:${theme.user}">telegram</span><span style="color:${theme.muted}"> → </span><a href="https://t.me/itsafzalbe" target="_blank" style="color:${theme.branch}; text-decoration:none;">tap in</a>`,
})

  addOutput({
  type: "text",
  html: `<span style="color:${theme.user}">linkedin</span> <span style="color:${theme.muted}"> → </span> <a href="https://linkedin.com/in/afzalbek-tohirjonov-12a5182ab"target="_blank" style="color:${theme.branch}; text-decoration:none;">connect</a>`,
})

  addOutput({
    type: "text",
    html: `<span style="color:${theme.user}">instagram</span> <span style="color:${theme.muted}"> → </span><a href="https://instagram.com/itsafzalbe" target="_blank" style="color:${theme.branch}; text-decoration:none;">mutuals?</a>`,
})

  addOutput({ type: "empty" })

  addOutput({
    type: "muted",
    text: "dont be weird tho [>_<]"
  })

  addOutput({ type: "empty" })
}