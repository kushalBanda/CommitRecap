"""FastAPI application entrypoint."""

from utils.pathing import standardize_sys_path

standardize_sys_path()

from fastapi import FastAPI
from server.api.routers.github_search_router import (
    router as github_search_router,
)

app = FastAPI(title="CommitRecap")

app.include_router(github_search_router)