import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminGetAll, deletePost, publishPost, unpublishPost } from "../../api/blog"

export default function Blog() {
  const [items, setItems] = useState([])
  const navigate          = useNavigate()

  const load = () => adminGetAll().then(d => setItems(d.items || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const handleDelete = async (slug) => {
    if (!confirm("Delete post?")) return
    await deletePost(slug)
    load()
  }

  const handleTogglePublish = async (post) => {
    if (post.is_published) await unpublishPost(post.slug)
    else await publishPost(post.slug)
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#c0caf5" }}>Blog</h1>
          <p style={{ fontSize: "13px", color: "#565f89" }}>{items.length} posts</p>
        </div>
        <button onClick={() => navigate("/admin/blog/new")}
          style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", background: "rgba(125,207,255,0.1)", border: "1px solid rgba(125,207,255,0.2)", color: "#7dcfff", cursor: "pointer" }}>
          + New Post
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(p => (
          <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#c0caf5", fontWeight: 500 }}>{p.title}</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: p.is_published ? "rgba(158,206,106,0.15)" : "rgba(247,118,142,0.15)", color: p.is_published ? "#9ece6a" : "#f7768e" }}>
                  {p.is_published ? "published" : "draft"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#565f89", marginTop: "2px" }}>
                {p.read_time} min read · {p.view_count} views · {p.tags?.join(", ")}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => handleTogglePublish(p)}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(158,206,106,0.1)", border: "1px solid rgba(158,206,106,0.2)", color: "#9ece6a", cursor: "pointer" }}>
                {p.is_published ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => navigate(`/admin/blog/${p.slug}`)}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(187,154,247,0.1)", border: "1px solid rgba(187,154,247,0.2)", color: "#bb9af7", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(p.slug)}
                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(247,118,142,0.1)", border: "1px solid rgba(247,118,142,0.2)", color: "#f7768e", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}