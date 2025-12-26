"""FastAPI application entrypoint."""

from utils.pathing import standardize_sys_path

standardize_sys_path()

from fastapi import FastAPI
from server.api.routers.github_search_router import (
    router as github_search_router,
)
from server.api.routers.health_router import router as health_router
from server.config.cors import setup_cors

app = FastAPI(title="CommitRecap")

# Setup CORS middleware
setup_cors(app)

app.include_router(github_search_router)
app.include_router(health_router)
