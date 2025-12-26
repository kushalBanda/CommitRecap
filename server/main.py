"""FastAPI application entrypoint."""

from utils.pathing import standardize_sys_path

standardize_sys_path()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.api.routers.github_search_router import (
    router as github_search_router,
)
from server.api.routers.health_router import router as health_router

app = FastAPI(title="CommitRecap")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Regex for Vercel domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github_search_router)
app.include_router(health_router)
