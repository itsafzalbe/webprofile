from datetime import datetime
from typing import Optional, List
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
import math
import logging

logger = logging.getLogger(__name__)

WORDS_PER_MINUTE = 200

def calculate_read_time(content: str) -> int:
    word_count = len(content.split())
    return max(1, math.ceil(word_count / WORDS_PER_MINUTE))


def _format(post: BlogPost, include_content: bool = True) -> dict:
    data = {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "tags": post.tags,
        "category": post.category,
        "cover_image": post.cover_image,
        "is_published": post.is_published,
        "view_count": post.view_count,
        "read_time": post.read_time,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }
    if include_content:
        data["content"] = post.content
    return data

async def get_all_posts(
    published_only: bool = True,
    tag: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20, 
    skip: int = 0,
) -> dict:
    query = {}
    if published_only: 
        query[BlogPost.is_published] = True
    if tag:
        query[BlogPost.tags] = tag
    if category:
        query[BlogPost.category] = category

    total =  await BlogPost.find(query).count()

    posts = (
        await BlogPost.find(query)
        .sort(-BlogPost.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )   
    return {
        "items": [_format(p, include_content=False) for p in posts],
        "total": total,
        "limit": limit,
        "skip": skip,
    }

async def get_post_by_slug(slug: str, increment_view: bool = False) -> Optional[dict]:
    post = await BlogPost.find_one(BlogPost.slug == slug)
    if not post:
        return None
    if increment_view and post.is_published:
        post.view_count += 1
        await post.save()
    return _format(post, include_content=True)

async def create_post(data: BlogPostCreate) -> dict:
    existing = await BlogPost.find_one(BlogPost.slug == data.slug)
    if existing:
        raise ValueError(f"Slug '{data.slug}' already exists")
    
    post = BlogPost(
        **data.model_dump(),
        read_time=calculate_read_time(data.content),
    )
    await post.insert()
    logger.info(f"Blog post created: {post.slug}")
    return _format(post)




async def update_post(slug: str, data: BlogPostUpdate) -> Optional[dict]:
    post = await BlogPost.find_one(BlogPost.slug == slug)
    if not post:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)
    
    # Recalculate read time if content changed
    if "content" in update_data:
        post.read_time = calculate_read_time(post.content)
    
    post.updated_at = datetime.utcnow()
    await post.save()
    logger.info(f"Blog post updated: {slug}")
    return _format(post)

async def delete_post(slug: str) -> bool:
    post = await BlogPost.find_one(BlogPost.slug == slug)
    if not post:
        return False
    await post.delete()
    logger.info(f"Blog post deleted: {slug}")
    return True


async def get_all_tags() -> List[str]:
    posts = await BlogPost.find(BlogPost.is_published == True).to_list()
    tags = set()
    for p in posts:
        tags.update(p.tags)
    return sorted(list(tags))




async def get_all_categories() -> List[str]:
    posts = await BlogPost.find(BlogPost.is_published == True).to_list()
    categories = {p.category for p in posts if p.category}
    return sorted(list(categories))


async def get_related_posts(slug: str, limit: int = 3) -> List[dict]:
    post = await BlogPost.find_one(BlogPost.slug == slug)
    if not post or not post.tags:
        return []
    related = (
        await BlogPost.find(
            BlogPost.is_published == True,
            BlogPost.slug != slug,
            BlogPost.tags.in_(post.tags),
        ).limit(limit).to_list()
    )
    return [_format(p, include_content=False) for p in related]