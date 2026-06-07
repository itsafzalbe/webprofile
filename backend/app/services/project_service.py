from datetime import datetime
from typing import Optional, List
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
import logging

logger = logging.getLogger(__name__)

def _format(project: Project) -> dict:
    return {
        "id": str(project.id),
        "title": project.title,
        "slug": project.slug,
        "description": project.description,
        "long_description": project.long_description,
        "tech_stack": project.tech_stack,
        "tags": project.tags,
        "screenshots": project.screenshots,
        "architecture_overview": project.architecture_overview,
        "github_url": project.github_url,
        "live_url": project.live_url,
        "challenges": project.challenges,
        "is_featured": project.is_featured,
        "is_published": project.is_published,
        "order": project.order,
        "view_count": project.view_count,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


async def get_all_projects( published_only: bool = True, tag: Optional[str] = None, featured_only: bool = False) -> List[dict]:
    query = {}
    if published_only:
        query[Project.is_published] = True
    if featured_only:
        query[Project.is_featured] = True
    if tag:
        query[Project.tags] = tag
    
    projects = await Project.find(query).sort(Project.order).to_list()
    return [_format(p) for p in projects]

async def get_project_by_slug(slug: str, increment_view: bool = False) -> Optional[dict]:
    project = await Project.find_one(Project.slug == slug)
    if not project:
        return None
    if increment_view:
        project.view_count += 1
        await project.save()
    return _format(project)


async def create_project(data: ProjectCreate) -> dict:
    existing = await Project.find_one(Project.slug == data.slug)
    if existing:
        raise ValueError(f"Slug '{data.slug}' already exists")
    
    project = Project(**data.model_dump())
    await project.insert()
    logger.info(f"Project created: {project.slug}")
    return _format(project)


async def update_project(slug: str, data: ProjectUpdate) -> Optional[dict]:
    project = await Project.find_one(Project.slug == slug)
    if not project:
        return None
    
    update_data = data.model_dump(exclude_unset=True)
    for field, vlaue in update_data.items():
        setattr(project, field, value)
    
    project.updated_at = datetime.utcnow()
    await project.save()
    logger.info(f"Project updated: {slug}")
    return _format(project)

async def delete_project(slug: str) -> bool:
    project = await Project.find_one(Project.slug == slug)
    if not project:
        return False
    await project.delete()
    logger.info(f"Project deleted: {slug}")
    return True

async def get_all_tags() -> List[str]:
    projects = await Project.find(Project.is_published == True).to_list()
    tags = set()
    for p in projects:
        tags.update(p.tags)
    return sorted(list(tags))
