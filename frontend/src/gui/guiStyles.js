/**
 * guiStyles.js
 * All shared style factories for GUI mode.
 * Every page imports from here — no duplicated inline objects.
 *
 * Usage:
 *   import { makeStyles } from "../guiStyles"
 *   const s = makeStyles(t)
 *   // then: style={s.card}, style={s.tag}, etc.
 */

export function makeStyles(t) {
  return {
    // ── Layout ───────────────────────────────────────────────────────────────
    page: {
      maxWidth:  "900px",
      margin:    "0 auto",
      padding:   "48px 32px 80px",
    },
    pageNarrow: {
      maxWidth:  "720px",
      margin:    "0 auto",
      padding:   "48px 32px 80px",
    },

    // ── Glass card ───────────────────────────────────────────────────────────
    card: {
      background:           t.glass,
      backdropFilter:       "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border:               `1px solid ${t.glassBorder}`,
      borderRadius:         "14px",
    },
    cardHoverable: {
      background:           t.glass,
      backdropFilter:       "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border:               `1px solid ${t.glassBorder}`,
      borderRadius:         "14px",
      transition:           "border-color 0.15s",
      cursor:               "pointer",
    },

    // ── Input ────────────────────────────────────────────────────────────────
    input: {
      padding:      "9px 12px",
      borderRadius: "8px",
      border:       `1px solid ${t.inputBorder}`,
      background:   t.inputBg,
      color:        t.text,
      fontSize:     "13px",
      outline:      "none",
      fontFamily:   "inherit",
      width:        "100%",
      boxSizing:    "border-box",
      transition:   "border-color 0.15s",
    },
    textarea: {
      padding:      "9px 12px",
      borderRadius: "8px",
      border:       `1px solid ${t.inputBorder}`,
      background:   t.inputBg,
      color:        t.text,
      fontSize:     "13px",
      outline:      "none",
      fontFamily:   "inherit",
      width:        "100%",
      boxSizing:    "border-box",
      resize:       "vertical",
      minHeight:    "100px",
      transition:   "border-color 0.15s",
    },

    // ── Buttons ──────────────────────────────────────────────────────────────
    btnPrimary: {
      padding:      "9px 20px",
      borderRadius: "8px",
      background:   t.accent,
      color:        t.bg === "#090909" ? "#000" : "#fff",
      border:       "none",
      fontSize:     "13px",
      fontWeight:   600,
      cursor:       "pointer",
      fontFamily:   "inherit",
      transition:   "opacity 0.15s",
    },
    btnSecondary: {
      padding:      "9px 20px",
      borderRadius: "8px",
      background:   t.surface,
      border:       `1px solid ${t.border}`,
      color:        t.text,
      fontSize:     "13px",
      fontWeight:   500,
      cursor:       "pointer",
      fontFamily:   "inherit",
      transition:   "border-color 0.15s",
    },

    // ── Tags / pills ─────────────────────────────────────────────────────────
    tag: {
      fontSize:     "10px",
      padding:      "2px 8px",
      borderRadius: "4px",
      background:   t.accentSoft,
      color:        t.accent,
      fontWeight:   500,
    },
    tagNeutral: {
      fontSize:     "11px",
      padding:      "3px 9px",
      borderRadius: "20px",
      background:   t.surface,
      color:        t.textMuted,
      border:       `1px solid ${t.border}`,
    },
    filterPill: (active) => ({
      padding:      "5px 12px",
      borderRadius: "20px",
      border:       `1px solid ${active ? t.accent : t.border}`,
      background:   active ? t.accentSoft : "transparent",
      color:        active ? t.accent : t.textMuted,
      fontSize:     "12px",
      cursor:       "pointer",
      fontFamily:   "inherit",
      fontWeight:   active ? 600 : 400,
      transition:   "all 0.15s",
    }),

    // ── Typography ───────────────────────────────────────────────────────────
    pageTitle: {
      fontSize:      "32px",
      fontWeight:    700,
      letterSpacing: "-0.02em",
      margin:        "0 0 8px",
      color:         t.text,
    },
    pageSubtitle: {
      fontSize: "14px",
      color:    t.textMuted,
      margin:   "0 0 32px",
    },
    sectionLabel: {
      fontSize:      "11px",
      fontWeight:    600,
      color:         t.textFaint,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      marginBottom:  "16px",
    },
    heroName: {
      fontSize:      "42px",
      fontWeight:    700,
      letterSpacing: "-0.03em",
      lineHeight:    1.1,
      margin:        "0 0 12px",
      color:         t.text,
    },
    heroTitle: {
      fontSize:   "18px",
      color:      t.textMuted,
      margin:     "0 0 16px",
      fontWeight: 400,
    },

    // ── Availability badge ───────────────────────────────────────────────────
    availBadge: (available) => ({
      display:       "inline-flex",
      alignItems:    "center",
      gap:           "6px",
      padding:       "4px 10px",
      borderRadius:  "20px",
      background:    available ? "rgba(158,206,106,0.12)" : "rgba(247,118,142,0.12)",
      border:        `1px solid ${available ? "rgba(158,206,106,0.3)" : "rgba(247,118,142,0.3)"}`,
      fontSize:      "11px",
      fontWeight:    500,
      color:         available ? t.success : t.error,
      marginBottom:  "20px",
      letterSpacing: "0.02em",
    }),

    // ── Grid layouts ─────────────────────────────────────────────────────────
    cardGrid: {
      display:             "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
      gap:                 "14px",
    },
    statGrid: {
      display:             "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap:                 "12px",
      marginBottom:        "48px",
    },

    // ── Misc ─────────────────────────────────────────────────────────────────
    divider: {
      border:    "none",
      borderTop: `1px solid ${t.border}`,
      margin:    "32px 0",
    },
    backLink: {
      fontSize:      "12px",
      color:         t.textMuted,
      textDecoration:"none",
      display:       "block",
      marginBottom:  "24px",
    },
    meta: {
      fontSize: "11px",
      color:    t.textFaint,
    },
  }
}

/** Hover helper — call on mouse enter/leave to toggle border */
export function hoverBorder(t, entering) {
  return { borderColor: entering ? t.borderHover : t.glassBorder }
}
