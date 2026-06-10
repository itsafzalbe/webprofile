export function parseCommand(input) {
  const trimmed = input.trim()
  if (!trimmed) return null

  const parts  = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || []
  const name   = parts[0]?.toLowerCase() || ""
  const args   = parts.slice(1).map(a => a.replace(/^"|"$/g, ""))

  // Parse flags like --tag backend
  const flags  = {}
  const positional = []

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2)
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true
      flags[key] = val
    } else if (args[i].startsWith("-") && args[i].length === 2) {
      const key = args[i].slice(1)
      const val = args[i + 1] && !args[i + 1].startsWith("-") ? args[++i] : true
      flags[key] = val
    } else {
      positional.push(args[i])
    }
  }

  return { raw: trimmed, name, args, flags, positional }
}