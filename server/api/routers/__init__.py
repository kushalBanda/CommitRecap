"""API router package."""

from api.routers.github_search_router import router as github_search_router
from api.routers.health_router import router as health_router

__all__ = ["github_search_router", "health_router"]
