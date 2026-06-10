export default async function echo({ parsed, addOutput }) {
  const text = parsed.args.join(" ")
  addOutput({ type: "text", text: text || "" })
}