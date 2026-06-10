import { useEffect, useState } from "react"
import { Link }                from "react-router-dom"
import { useThemeStore }       from "../../store/useThemeStore"
import { guiThemes }           from "../guiTheme"
import { makeStyles }          from "../guiStyles"
import { getPosts, getBlogTags } from "../../api/blog"
import { formatDate, formatReadTime } from "../../utils/formatters"

export default function Blog() {
  const { guiTheme } = useThemeStore()
  const t = guiThemes[guiTheme]
  const s = makeStyles(t)

  const [posts,     setPosts]     = useState([])
  const [tags,      setTags]      = useState([])
  const [activeTag, setActiveTag] = useState("all")
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getBlogTags().then(d => setTags(Array.isArray(d) ? d : (d.tags || []))).catch(() => {})
    getPosts().then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = activeTag === "all" ? posts : posts.filter(p => p.tags?.includes(activeTag))

  return (
    <div style={s.pageNarrow}>
      <h1 style={s.pageTitle}>Blog</h1>
      <p style={s.pageSubtitle}>Writing on backend engineering, systems, and software.</p>

      {tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"28px" }}>
          {["all", ...tags].map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} style={s.filterPill(activeTag === tag)}>{tag}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {[1,2,3].map(i => <div key={i} style={{ ...s.card, height:"90px", opacity:0.4 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color:t.textMuted, fontSize:"14px" }}>No posts yet.</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {filtered.map(post => <BlogCard key={post.slug} post={post} t={t} s={s} />)}
        </div>
      )}
    </div>
  )
}

function BlogCard({ post, t, s }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={`/gui/blog/${post.slug}`} style={{
      ...s.card, padding:"22px 24px", textDecoration:"none", display:"block",
      borderColor: hovered ? t.borderHover : t.glassBorder,
      transition:"border-color 0.15s",
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {post.category && <span style={{ fontSize:"11px", color:t.accent, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:"6px" }}>{post.category}</span>}
      <div style={{ fontSize:"15px", fontWeight:600, color:t.text, marginBottom:"5px" }}>{post.title}</div>
      <div style={{ fontSize:"13px", color:t.textMuted, lineHeight:1.6, marginBottom:"12px" }}>
        {post.excerpt?.slice(0,120)}{post.excerpt?.length > 120 ? "…" : ""}
      </div>
      <div style={{ display:"flex", gap:"16px" }}>
        <span style={{ fontSize:"11px", color:t.textFaint }}>{formatDate(post.published_at)}</span>
        {post.read_time && <span style={{ fontSize:"11px", color:t.textFaint }}>{formatReadTime(post.read_time)}</span>}
      </div>
    </Link>
  )
}
