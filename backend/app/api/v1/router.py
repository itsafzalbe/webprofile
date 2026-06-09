from fastapi import APIRouter
from app.api.v1 import auth, projects, blog, contact, github, search, analytics, profile, achievements, experience, resume, filesystem

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(blog.router)
router.include_router(contact.router)
router.include_router(github.router)
router.include_router(search.router)
router.include_router(analytics.router)
router.include_router(profile.router)
router.include_router(achievements.router)
router.include_router(experience.router)
router.include_router(resume.router)
router.include_router(filesystem.router)

