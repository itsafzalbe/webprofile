from fastapi import APIRouter
from app.api.v1 import auth, projects, blog

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(blog.router)



# Uncomment as we build each module:
# from app.api.v1 import projects, blog, contact, github, search, analytics, system, assistant
# router.include_router(blog.router)
# router.include_router(contact.router)
# router.include_router(github.router)
# router.include_router(search.router)
# router.include_router(analytics.router)
# router.include_router(system.router)
# router.include_router(assistant.router)