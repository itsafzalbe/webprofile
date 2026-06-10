import { useState, useEffect, useRef, useCallback } from "react"
import { useThemeStore }    from "../store/useThemeStore"
import { useTerminalStore } from "../store/useTerminalStore"
import { themes }           from "../themes/themes"
import { parseCommand }     from "./CommandParser"
import { getRegistry }      from "./CommandRegistry"
import { trackCommand, trackSession } from "../api/analytics"
import { buildPromptPath }  from "../utils/formatters"
import { suggestions }      from "../api/search"

// Inject global styles once
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

  .term-scroll::-webkit-scrollbar { width: 4px; }
  .term-scroll::-webkit-scrollbar-track { background: transparent; }
  .term-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  @keyframes term-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes term-flicker {
    0%   { opacity: 1;    }
    4%   { opacity: 0.96; }
    8%   { opacity: 1;    }
    72%  { opacity: 1;    }
    76%  { opacity: 0.97; }
    80%  { opacity: 1;    }
  }
`

if (!document.getElementById("term-global-style")) {
  const el = document.createElement("style")
  el.id = "term-global-style"
  el.textContent = GLOBAL_STYLE
  document.head.appendChild(el)
}

export default function Terminal() {
  const { terminalTheme }  = useThemeStore()
  const theme              = themes[terminalTheme] || themes["retro_amber"]
  const isRetro            = ["retro_amber", "retro_green", "classic_green"].includes(terminalTheme)

  const {
    output, addOutput, clearOutput,
    pushHistory, currentPath,
    history, historyIndex,
    setHistoryIndex,
    trackCommand: trackUsed,
    usedCommands,
  } = useTerminalStore()

  const [inputValue, setInputValue] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [isRunning,  setIsRunning]  = useState(false)

  const containerRef = useRef(null)
  const inputRef     = useRef(null)
  const bottomRef    = useRef(null)

  // Session tracking
  useEffect(() => { trackSession().catch(() => {}) }, [])

  // Welcome message — once only
  const welcomeAdded = useRef(false)
  useEffect(() => {
    if (welcomeAdded.current) return
    if (output.length === 0) {
      welcomeAdded.current = true
      addOutput({type: "accent",
                  text: `
                        ██╗    ██╗ █████╗ ███████╗███████╗ ██████╗  ██████╗  ██████╗ ██████╗
                        ██║    ██║██╔══██╗██╔════╝██╔════╝██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗
                        ██║ █╗ ██║███████║███████╗███████╗██║  ███╗██║   ██║██║   ██║██║  ██║
                        ██║███╗██║██╔══██║╚════██║╚════██║██║   ██║██║   ██║██║   ██║██║  ██║
                        ╚███╔███╔╝██║  ██║███████║███████║╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝
                          ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝
                        `.replace(/^\s+/gm, "").trim(),})
      addOutput({type: "muted", text: "shi finally loaded • type 'help' or sum"})
      addOutput({ type: "empty" })
    }
  }, [])
 // eslint-disable-line

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [output, inputValue])

  // Click to focus
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const focus = () => inputRef.current?.focus()
    el.addEventListener("click", focus)
    return () => el.removeEventListener("click", focus)
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  const runCommand = useCallback(async (raw) => {
    const parsed = parseCommand(raw)
    if (!parsed) return

    pushHistory(raw)
    trackCommand(parsed.name, parsed.args.join(" ")).catch(() => {})
    trackUsed(parsed.name)

    const registry = getRegistry()
    const handler  = registry[parsed.name]

    if (!handler) {
      addOutput({ type: "error", text: `${parsed.name}: never heard of that shi gang` })
      return
    }

    setIsRunning(true)
    try {
      await handler({ parsed, addOutput, clearOutput, theme })
    } catch (err) {
      addOutput({ type: "error", text: `Error: ${err.message || "Something went wrong"}` })
    } finally {
      setIsRunning(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [currentPath, theme, pushHistory, trackUsed, addOutput, clearOutput])

  const handleKeyDown = async (e) => {
    switch (e.key) {
      case "Enter": {
        e.preventDefault()
        const val = inputValue.trim()
        addOutput({ type: "input", text: val, path: currentPath })
        setInputValue("")
        setSuggestion("")
        setHistoryIndex(-1)
        if (val) await runCommand(val)
        break
      }
      case "ArrowUp": {
        e.preventDefault()
        const next = Math.min(historyIndex + 1, history.length - 1)
        setHistoryIndex(next)
        setInputValue(history[next] || "")
        break
      }
      case "ArrowDown": {
        e.preventDefault()
        const next = Math.max(historyIndex - 1, -1)
        setHistoryIndex(next)
        setInputValue(next === -1 ? "" : history[next] || "")
        break
      }
      case "Tab": {
        e.preventDefault()
        if (suggestion) {
          setInputValue(suggestion)
          setSuggestion("")
        } else if (inputValue.trim().length >= 2) {
          try {
            const res = await suggestions(inputValue.trim())
            if (res.suggestions?.length > 0) setSuggestion(res.suggestions[0])
          } catch {}
        }
        break
      }
      case "c": {
        if (e.ctrlKey) {
          e.preventDefault()
          addOutput({ type: "input", text: inputValue + "^C", path: currentPath })
          setInputValue("")
          setSuggestion("")
        }
        break
      }
      case "l": {
        if (e.ctrlKey) { e.preventDefault(); clearOutput(); setInputValue("") }
        break
      }
      case "a": {
        if (e.ctrlKey) { e.preventDefault(); e.target.setSelectionRange(0, 0) }
        break
      }
      case "e": {
        if (e.ctrlKey) { e.preventDefault(); e.target.setSelectionRange(inputValue.length, inputValue.length) }
        break
      }
    }
  }

  const promptPath = buildPromptPath(currentPath)
  const mono = "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace"

  return (
    <div
      ref={containerRef}
      style={{
        width:           "100%",
        height:          "100%",
        display:         "flex",
        flexDirection:   "column",
        backgroundColor: theme.bg,
        border:          `1px solid ${theme.border}`,
        borderRadius:    "6px",
        overflow:        "hidden",
        fontFamily:      mono,
        cursor:          "text",
        position:        "relative",
        // Retro glow on the whole box
        boxShadow: isRetro
          ? `0 0 0 1px ${theme.border}, 0 0 30px ${theme.accent}18, inset 0 0 60px rgba(0,0,0,0.5)`
          : "none",
        animation: isRetro ? "term-flicker 8s infinite" : "none",
      }}
    >
      {/* Scanline overlay — retro only */}
      {isRetro && (
        <div style={{
          position:       "absolute",
          inset:          0,
          pointerEvents:  "none",
          zIndex:         10,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px)",
          backgroundSize:  "100% 2px",
        }} />
      )}

      {/* Title bar */}
      <div style={{
        display:         "flex",
        alignItems:      "center",
        gap:             "8px",
        padding:         "8px 16px",
        borderBottom:    `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
        flexShrink:      0,
      }}>
        <div style={{ display: "flex", gap: "5px" }}>
  {[
    { bg: "#3a3a3a", symbol: "1" },
    { bg: "#4a4a4a", symbol: "0" },
    { bg: "#2f5f2f", symbol: ">" },
  ].map((btn, i) => (
    <div
      key={i}
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "2px",
        background: btn.bg,
        border: "1px solid #111",
        color: "#111",
        fontSize: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        fontFamily: "monospace",
      }}
    >
      {btn.symbol}
    </div>
  ))}
</div>
        <span style={{
          flex:1, textAlign:"center", fontSize:"20px",
          color: theme.muted, fontFamily: mono,
          letterSpacing: isRetro ? "0.15em" : "0.05em",
          textTransform: isRetro ? "uppercase" : "none",
        }}>
          {isRetro ? "[ AFZALBEK@OS :: LEGACY BUILD ]" : ":: afzalbe@os — current build ::"}
        </span>
      </div>

      {/* Output area */}
      <div
        className="term-scroll"
        style={{
          flex:      1,
          overflowY: "auto",
          padding:   "16px 20px",
          fontSize:  "25px",
          lineHeight: isRetro ? "1.9" : "1.7",
        }}
      >
        {output.map((line) => (
          <OutputLine key={line.id} line={line} theme={theme} promptPath={promptPath} mono={mono} isRetro={isRetro} />
        ))}

        {/* Active input line */}
        <div style={{ display:"flex", alignItems:"center", minHeight:"1.9em" }}>
          <Prompt path={promptPath} theme={theme} mono={mono} isRetro={isRetro} />

          <div style={{ position:"relative", flex:1, display:"flex", alignItems:"center" }}>
            {/* Ghost suggestion */}
            {suggestion && (
              <span style={{
                position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
                color:theme.muted, pointerEvents:"none",
                whiteSpace:"pre", fontSize:"25px", fontFamily:mono,
              }}>
                {inputValue}
                <span style={{ opacity:0.35 }}>{suggestion.slice(inputValue.length)}</span>
              </span>
            )}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setSuggestion("") }}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              style={{
                flex:       1,
                background: "transparent",
                border:     "none",
                outline:    "none",
                color:      theme.text,
                caretColor: theme.cursor,
                fontSize:   "25px",
                fontFamily: mono,
                lineHeight: isRetro ? "1.9" : "1.7",
                width:      "100%",
                minWidth:   "1px",
                // Retro text glow
                textShadow: isRetro ? `0 0 8px ${theme.accent}99` : "none",
              }}
            />
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ── Output line renderer ──────────────────────────────────────────────────────
function OutputLine({ line, theme, promptPath, mono, isRetro }) {
  const glow = isRetro ? `0 0 6px ${theme.accent}88` : "none"

  if (line.type === "empty") return <div style={{ height:"0.5rem" }} />

  if (line.type === "input") {
    return (
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", marginBottom:"1px" }}>
        <Prompt path={line.path || promptPath} theme={theme} mono={mono} isRetro={isRetro} />
        <span style={{ color:theme.text, textShadow:glow }}>{line.text}</span>
      </div>
    )
  }

  if (line.html) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: line.html }}
        style={{ textShadow: glow }}
      />
    )
  }

  return (
    <div style={{
      color:      getColor(line.type, theme),
      textShadow: isRetro ? `0 0 6px ${getColor(line.type, theme)}88` : "none",
      whiteSpace: "pre-wrap",
      wordBreak:  "break-words",
    }}>
      {line.text}
    </div>
  )
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function Prompt({ path, theme, mono }) {
  return (
    <span style={{
      display:     "flex",
      alignItems:  "center",
      flexShrink:  0,
      marginRight: "6px",
      userSelect:  "none",
      fontFamily:  mono,
    }}>
      <span style={{ color: theme.path, fontWeight: 500 }}>{path}</span>
      <span style={{ color: theme.accent, margin: "0 6px", fontWeight: "bold" }}>→</span>
    </span>
  )


  // Modern prompt — colored segments
  return (
    <span style={{ display:"flex", alignItems:"center", gap:"4px", flexShrink:0, marginRight:"6px", userSelect:"none" }}>
      <Segment label="afzalbe" color={theme.user} />
      <span style={{ color:theme.muted, fontSize:"25px" }}>in</span>
      <Segment label={path} color={theme.path} />
      <span style={{ color:theme.accent, fontWeight:"bold", margin:"0 4px" }}>→</span>
    </span>
  )
}

function Segment({ label, color }) {
  return (
    <span style={{
      backgroundColor: color + "22",
      color:           color,
      padding:         "0px 7px",
      borderRadius:    "3px",
      fontSize:        "25px",
      fontWeight:      600,
    }}>{label}</span>
  )
}

function getColor(type, theme) {
  switch (type) {
    case "error":   return theme.error
    case "success": return theme.success
    case "warning": return theme.warning
    case "muted":   return theme.muted
    case "accent":  return theme.accent
    case "user":    return theme.user
    case "path":    return theme.path
    default:        return theme.text
  }
}