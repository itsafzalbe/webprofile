import { useEffect, useState, useRef } from "react"
import { useParams, Link }             from "react-router-dom"
import ReactMarkdown                   from "react-markdown"
import remarkGfm                       from "remark-gfm"
import { useThemeStore }               from "../../store/useThemeStore"
import { guiThemes }                   from "../guiTheme"
import { makeStyles }                  from "../guiStyles"
import { getPost, getRelated }         from "../../api/blog"
import { formatDate, formatReadTime }  from "../../utils/formatters"

export default function BlogPost() {
  const { slug }     = useParams()
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [post,    setPost]    = useState(null)
  const [related, setRelated] = useState([])
  const [scroll,  setScroll]  = useState(0)
  const [err,     setErr]     = useState(false)

  useEffect(() => {
    getPost(slug).then(setPost).catch(() => setErr(true))
    getRelated(slug).then(d => setRelated(Array.isArray(d) ? d : [])).catch(() => {})
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScroll(Math.min(100, pct || 0))
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (err) return <div style={s.pageNarrow}><p style={{ color:t.textMuted }}>Post not found. <Link to="/gui/blog" style={{ color:t.accent }}>← Back</Link></p></div>
  if (!post) return <div style={s.pageNarrow}><p style={{ color:t.textMuted }}>Loading…</p></div>

  return (
    <>
      {/* Reading progress */}
      <div style={{ position:"fixed", top:0, left:0, height:"2px", width:`${scroll}%`, background:t.accent, transition:"width 0.1s linear", zIndex:100 }} />

      <div style={s.pageNarrow}>
        <Link to="/gui/blog" style={s.backLink}>← Blog</Link>

        {post.category && <span style={{ fontSize:"11px", color:t.accent, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:"10px" }}>{post.category}</span>}
        <h1 style={{ ...s.pageTitle, fontSize:"30px", lineHeight:1.2, marginBottom:"16px" }}>{post.title}</h1>

        <div style={{ display:"flex", gap:"16px", marginBottom:"40px" }}>
          <span style={s.meta}>{formatDate(post.published_at)}</span>
          {post.read_time && <span style={s.meta}>{formatReadTime(post.read_time)}</span>}
        </div>

        {/* Markdown */}
        <style>{`
          .blog-md h1,.blog-md h2,.blog-md h3{color:${t.text};font-weight:600;margin:2em 0 .75em;letter-spacing:-.01em}
          .blog-md h1{font-size:24px}.blog-md h2{font-size:20px}.blog-md h3{font-size:16px}
          .blog-md p{margin:0 0 1.2em;color:${t.textMuted};font-size:15px;line-height:1.8}
          .blog-md a{color:${t.accent};text-decoration:none}
          .blog-md code{font-family:'JetBrains Mono',monospace;font-size:13px;background:${t.surface};border:1px solid ${t.border};padding:2px 6px;border-radius:4px;color:${t.text}}
          .blog-md pre{background:${t.surface};border:1px solid ${t.border};border-radius:10px;padding:20px;overflow-x:auto;margin:1.5em 0}
          .blog-md pre code{background:none;border:none;padding:0}
          .blog-md blockquote{border-left:3px solid ${t.accent};margin:1.5em 0;padding:0 0 0 20px;color:${t.textMuted}}
          .blog-md ul,.blog-md ol{padding-left:24px;margin:0 0 1.2em}
          .blog-md li{margin-bottom:4px;color:${t.textMuted};font-size:15px;line-height:1.8}
          .blog-md hr{border:none;border-top:1px solid ${t.border};margin:2em 0}
          .blog-md img{max-width:100%;border-radius:10px;margin:1.5em 0}
          .blog-md table{width:100%;border-collapse:collapse;margin:1.5em 0;font-size:13px}
          .blog-md th,.blog-md td{padding:8px 12px;border:1px solid ${t.border}}
          .blog-md th{background:${t.surface};color:${t.text};font-weight:600}
        `}</style>
        <div className="blog-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || post.body || ""}</ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"40px", paddingTop:"24px", borderTop:`1px solid ${t.border}` }}>
            {post.tags.map(tag => <span key={tag} style={s.tagNeutral}>{tag}</span>)}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop:"48px" }}>
            <div style={s.sectionLabel}>Related Posts</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {related.map(r => (
                <Link key={r.slug} to={`/gui/blog/${r.slug}`} style={{
                  ...s.card, padding:"14px 18px", textDecoration:"none",
                  fontSize:"13px", color:t.text, fontWeight:500,
                  transition:"border-color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.glassBorder}
                >{r.title}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
