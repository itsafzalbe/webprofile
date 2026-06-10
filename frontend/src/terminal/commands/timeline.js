import experienceCommand from "./experience"

export default async function timeline({ parsed, addOutput, theme  }) {
  addOutput({ type: "accent", text: "── The Lore So Far ───────────────────────" })
  addOutput({ type: "empty" })
  await experienceCommand({ parsed, addOutput, theme, hideTitle: true, })
}
