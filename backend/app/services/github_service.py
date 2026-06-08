import httpx
import json
import logging
from typing import Optional
from app.config import settings
from app.database import get_redis

logger = logging.getLogger(__name__)

BASE_URL = "https://api.github.com"
CACHE_TTL = 600

def _headers() -> dict:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return headers

async def _get_cached(key: str) -> Optional[dict]:
    redis = get_redis()
    if not redis:
        return None
    try:
        data = await redis.get(f"gitub:{key}")
        return json.loads(data) if data else None
    except Exception as e:
        logger.error(f"Cache read error: {e}")
        return None


async def _set_cached(key: str, data: dict, ttl: int = CACHE_TTL) -> None:
    redis = get_redis()
    if not redis:
        return
    try:
        await redis.setex(f"github:{key}", ttl, json.dumps(data, default=str))
    except Exception as e:
        logger.error(f"Cache write error: {e}")

async def get_profile() -> Optional[dict]:
    cached = await _get_cached("profile")
    if cached:
        return cached
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/users/{settings.GITHUB_USERNAME}",
                headers = _headers(),
                timeout=10,
            )
            resp.raise_for_status()
            data=resp.json()
        result = {
            "username": data.get("login"),
            "name": data.get("name"),
            "bio": data.get("bio"),
            "avatar_url": data.get("avatar_url"),
            "html_url": data.get("html_url"),
            "public_repos": data.get("public_repos"),
            "followers": data.get("followers"),
            "following": data.get("following"),
            "location": data.get("location"),
            "company": data.get("company"),
            "blog": data.get("blog"),
            "created_at": data.get("created_at"),
        }
        await _set_cached("profile", result)
        return result
    except httpx.HTTPError as e:
        logger.error(f"GitHub profile fetch failed: {e}")
        return None


async def get_repos(sort: str = "udpated", limit: int = 10) -> list:
    cache_key = f"repos:{sort}:{limit}"
    cached = await _get_cached(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/users/{settings.GITHUB_USERNAME}/repos",
                headers=_headers(),
                params={
                    "sort": sort,
                    "per_page": limit,
                    "type": "owner",
                },
                timeout=10,
            )
            resp.raise_for_status()
            repos = resp.json()
        
        result = [
            {
                "name": r.get("name"),
                "full_name": r.get("full_name"),
                "description": r.get("description"),
                "html_url": r.get("html_url"),
                "language": r.get("language"),
                "stars": r.get("stargazers_count"),
                "forks": r.get("forks_count"),
                "watchers": r.get("watchers_count"),
                "is_fork": r.get("fork"),
                "is_private": r.get("private"),
                "topics": r.get("topics", []),
                "created_at": r.get("created_at"),
                "updated_at": r.get("updated_at"),
                "pushed_at": r.get("pushed_at"),
            }
            for r in repos
        ]
        await _set_cached(cache_key, result)
        return result
    except httpx.HTTPError as e:
        logger.error(f"GitHub repos fetch failed: {e}")
        return []

async def get_pinned_repos() -> list:
    cached = await _get_cached("pinned")
    if cached: 
        return cached
    
    query = """
    {
      user(login: "%s") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              primaryLanguage { name }
              stargazerCount
              forkCount
              repositoryTopics(first: 5) {
                nodes { topic { name } }
              }
              updatedAt
            }
          }
        }
      }
    }
    """ % settings.GITHUB_USERNAME

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.github.com/graphql",
                headers=_headers(),
                json={"query": query},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
        nodes = (
            data.get("data", {})
            .get("user", {})
            .get("pinnedItems", {})
            .get("nodes", [])
        )
        result = [
            {
                "name": n.get("name"),
                "description": n.get("description"),
                "url": n.get("url"),
                "language": (n.get("primaryLanguage") or {}).get("name"),
                "stars": n.get("stargazerCount"),
                "forks": n.get("forkCount"),
                "topics": [
                    t["topic"]["name"]
                    for t in n.get("repositoryTopics", {}).get("nodes", [])
                ],
                "updated_at": n.get("updatedAt"),
            }
            for n in nodes
        ]
        await _set_cached("pinned", result, ttl=900)
        return result
    except httpx.HTTPError as e:
        logger.error(f"GitHub pinned repos fetch failed: {e}")
        return await get_repos(sort="updated", limit=6)


async def get_recent_commits(repo: str, limit: int = 10) -> list:
    cache_key = f"commits:{repo}:{limit}"
    cached = await _get_cached(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/repos/{settings.GITHUB_USERNAME}/{repo}/commits",
                headers=_headers(),
                params={"per_page": limit},
                timeout=10,
            )
            resp.raise_for_status()
            commits = resp.json()
        
        result = [
            {
                "sha": c.get("sha", "")[:7],
                "message": c.get("commit", {}).get("message", "").split("\n")[0],
                "author": c.get("commit", {}).get("author", {}).get("name"),
                "date": c.get("commit", {}).get("author", {}).get("date"),
                "url": c.get("html_url"),
            }
            for c in commits
        ]
        await _set_cached(cache_key, result, ttl=300)
        return result
    except httpx.HTTPError as e:
        logger.error(f"GitHub commits fetch failed: {e}")
        return []

async def get_contribution_stats() -> dict:
    cached = await _get_cached("contributions")
    if cached:
        return cached
    
    query = """
    {
      user(login: "%s") {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
    """ % settings.GITHUB_USERNAME

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.github.com/graphql",
                headers=_headers(),
                json={"query": query},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        collection = (
            data.get("data", {})
            .get("user", {})
            .get("contributionsCollection", {})
        )

        calendar = collection.get("contributionCalendar", {})
        weeks = calendar.get("weeks", [])

        # Flatten days for frontend heatmap
        days = [
            day
            for week in weeks
            for day in week.get("contributionDays", [])
        ]

        result = {
            "total_contributions": calendar.get("totalContributions", 0),
            "total_commits": collection.get("totalCommitContributions", 0),
            "total_prs": collection.get("totalPullRequestContributions", 0),
            "total_issues": collection.get("totalIssueContributions", 0),
            "total_repos": collection.get("totalRepositoryContributions", 0),
            "calendar": days,
        }

        await _set_cached("contributions", result, ttl=3600)
        return result

    except httpx.HTTPError as e:
        logger.error(f"GitHub contributions fetch failed: {e}")
        return {}
    

async def get_repo_languages(repo: str) -> dict:
    cache_key = f"langueges:{repo}"
    cached = await _get_cached(cache_key)
    if cached:
        return cached
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/repos/{settings.GITHUB_USERNAME}/{repo}/languages",
                headers=_headers(),
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
        
        total = sum(data.values())
        result = {
            lang: round((bytes_count / total) * 100, 1)
            for lang, bytes_count in data.items()
        }
        await _set_cached(cache_key, result, ttl=3600)
        return result
    
    except httpx.HTTPError as e:
        logger.error(f"GitHub languages fetch failed: {e}")
        return {}