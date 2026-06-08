import time
import logging
from typing import List
from app.models.project import Project
from app.models.blog import BlogPost
from app.models.filesystem import FileSystemNode

logger = logging.getLogger(__name__)

SKILLS = [
    {
        "name": "FastAPI",
        "category": "backend",
        "description": "High-performance async Python web framework",
        "tags": ["python", "api", "backend", "async"],
    },
    {
        "name": "Django REST Framework",
        "category": "backend",
        "description": "Powerful and flexible toolkit for building Web APIs",
        "tags": ["python", "django", "api", "backend"],
    },
    {
        "name": "PostgreSQL",
        "category": "database",
        "description": "Advanced open source relational database",
        "tags": ["database", "sql", "relational"],
    },
    {
        "name": "MongoDB",
        "category": "database",
        "description": "Document-oriented NoSQL database",
        "tags": ["database", "nosql", "mongodb"],
    },
    {
        "name": "React",
        "category": "frontend",
        "description": "JavaScript library for building user interfaces",
        "tags": ["javascript", "frontend", "ui"],
    },
    {
        "name": "Docker",
        "category": "devops",
        "description": "Platform for containerizing applications",
        "tags": ["devops", "containers", "deployment"],
    },
    {
        "name": "Redis",
        "category": "infrastructure",
        "description": "In-memory data structure store used as cache",
        "tags": ["cache", "redis", "infrastructure"],
    },
    {
        "name": "WebSockets",
        "category": "backend",
        "description": "Real-time bidirectional communication protocol",
        "tags": ["realtime", "websocket", "backend"],
    },
    {
        "name": "Java",
        "category": "backend",
        "description": "Object-oriented programming language",
        "tags": ["java", "backend", "oop"],
    },
    {
        "name": "C / C++",
        "category": "systems",
        "description": "Low-level systems programming languages",
        "tags": ["c", "cpp", "systems", "low-level"],
    },

]


def _truncate(text: str, length: int = 120) -> str:
    if not text:
        return ""
    return text[:length] + "..." if len(text) > length else text


def _search_skills(query: str) -> list:
    q = query.lower()
    results = []
    for skill in SKILLS:
        searchable = f"{skill['name']} {skill['description']} {' '.join(skill['tags'])}".lower()
        if q in searchable:
            results.append({
                "type": "skill",
                "title": skill["name"],
                "excerpt": skill["description"],
                "slug": None,
                "path": None,
                "tags": skill["tags"],
                "url": None,
                "score": 1.0 if q in skill["name"].lower() else 0.5,
            })
    return results


async def _search_projects(query: str) -> list:
    try:
        collection = Project.get_motor_collection()
        cursor = collection.find(
            {
                "$text": {"$search": query},
                "is_published": True,
            },
            {"score": {"$meta": "textScore"}},
        ).sort([("score", {"$meta": "textScore"})]).limit(5)

        results = []
        async for doc in cursor:
            results.append({
                "type": "project",
                "title": doc.get("title", ""),
                "excerpt": _truncate(doc.get("description", "")),
                "slug": doc.get("slug"),
                "path": None,
                "tags": doc.get("tags", []),
                "url": f"/projects/{doc.get('slug')}",
                "score": doc.get("score", 0.0),
            })
        return results
    except Exception as e:
        logger.error(f"Project search error: {e}")
        return []

async def _search_blog(query: str) -> list:
    try:
        collection = BlogPost.get_motor_collection()
        cursor = collection.find(
            {
                "$text": {"$search": query},
                "is_published": True,
            },
            {"score": {"$meta": "textScore"}},
        ).sort([("score", {"$meta": "textScore"})]).limit(5)

        results = []
        async for doc in cursor:
            results.append({
                "type": "blog",
                "title": doc.get("title", ""),
                "excerpt": _truncate(doc.get("excerpt", "")),
                "slug": doc.get("slug"),
                "path": None,
                "tags": doc.get("tags", []),
                "url": f"/blog/{doc.get('slug')}",
                "score": doc.get("score", 0.0),
            })
        return results
    except Exception as e:
        logger.error(f"Blog search error: {e}")
        return []


async def _search_filesystem(query: str) -> list:
    try:
        collection = FileSystemNode.get_motor_collection()
        cursor = collection.find(
            {
                "$text": {"$search": query},
                "is_hidden": False,
                "node_type": "file",
            },
            {"score": {"$meta": "textScore"}},
        ).sort([("score", {"$meta": "textScore"})]).limit(5)

        results = []
        async for doc in cursor:
            results.append({
                "type": "file",
                "title": doc.get("name", ""),
                "excerpt": _truncate(doc.get("content", "")),
                "slug": None,
                "path": doc.get("path"),
                "tags": [],
                "url": None,
                "score": doc.get("score", 0.0),
            })
        return results
    except Exception as e:
        logger.error(f"Filesystem search error: {e}")
        return []

async def search(query: str, search_type: str = "all") -> dict:
    if not query or len(query.strip()) < 2:
        return {
            "query": query,
            "total": 0,
            "results": [],
            "took_ms": 0.0,
        }
    start = time.time()
    query = query.strip()
    results = []

    if search_type in ("all", "projects"):
        results.extend(await _search_projects(query))

    if search_type in ("all", "blog"):
        results.extend(await _search_blog(query))

    if search_type in ("all", "skills"):
        results.extend(await _search_skills(query))

    if search_type in ("all", "files"):
        results.extend(await _search_filesystem(query))

    results.sort(key=lambda x: x["score"], reverse=True)

    took_ms = round((time.time() - start) * 1000, 2)

    return {
        "query": query,
        "total": len(results),
        "results": results,
        "took_ms": took_ms,
    }


async def get_suggestions(query: str, limit: int = 5) -> List[str]:
    if not query or len(query) < 1:
        return []
    
    suggestions = set()
    q = query.lower()

    projects = await Project.find(
        Project.is_published==True
    ).to_list()
    for p in projects:
        if q in p.title.lower():
            suggestions.add(p.title)
        for tag in p.tags:
            if q in tag.lower():
                suggestions.add(tag)

    posts = await BlogPost.find(
        BlogPost.is_published == True
    ).to_list()
    for p in posts:
        if q in p.title.lower():
            suggestions.add(p.title)
    
    for skill in SKILLS:
        if q in skill["name"].lower():
            suggestions.add(skill["name"])
    return sorted(list(suggestions))[:limit]