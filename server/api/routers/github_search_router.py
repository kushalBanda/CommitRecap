"""GitHub search endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from server.api.controllers import github_search_controller
from server.config.env import Environment

DEFAULT_START_DATE = Environment.START_DATE
DEFAULT_END_DATE = Environment.END_DATE

router = APIRouter(prefix="/github/search", tags=["github-search"])


@router.get("/commit-count-monthly-2025")
def fetch_commit_count_monthly_2025(
    username: str = Query(..., min_length=1),
):
    """Fetch commit counts per month for 2025."""
    return github_search_controller.fetch_commit_count_monthly_2025(
        username=username,
    )


@router.get("/repo-focus")
def fetch_repo_focus_and_collaboration(
    username: str = Query(..., min_length=1),
    since: str = Query(DEFAULT_START_DATE, min_length=1),
    until: str = Query(DEFAULT_END_DATE, min_length=1),
    per_page: int = Query(100, ge=1, le=100),
    max_pages: int = Query(10, ge=1, le=10),
    max_workers: int = Query(8, ge=1, le=16),
    top_n: int = Query(10, ge=1, le=50),
):
    """Fetch top repos by commits and distinct repo count."""
    return github_search_controller.fetch_repo_focus_and_collaboration(
        username=username,
        since=since,
        until=until,
        per_page=per_page,
        max_pages=max_pages,
        max_workers=max_workers,
        top_n=top_n,
    )


@router.get("/languages")
def fetch_languages(
    username: str = Query(..., min_length=1),
    since: str = Query(DEFAULT_START_DATE, min_length=1),
    until: str = Query(DEFAULT_END_DATE, min_length=1),
    per_page: int = Query(100, ge=1, le=100),
    page: int = Query(1, ge=1),
):
    """Fetch repo languages within a date range."""
    return github_search_controller.fetch_most_used_languages(
        username=username,
        since=since,
        until=until,
        per_page=per_page,
        page=page,
    )


@router.get("/repo-count")
def fetch_repo_count(
    username: str = Query(..., min_length=1),
    per_page: int = Query(100, ge=1, le=100),
    page: int = Query(1, ge=1),
):
    """Fetch public repo count for a user."""
    return github_search_controller.fetch_repo_count(
        username=username,
        per_page=per_page,
        page=page,
    )


@router.get("/user-summary")
def fetch_user_summary(
    username: str = Query(..., min_length=1),
):
    """Fetch summary stats for a user."""
    return github_search_controller.fetch_user_summary(
        username=username,
    )


@router.get("/rate-limit")
def fetch_rate_limit():
    """Fetch current GitHub API rate limit status."""
    return github_search_controller.fetch_rate_limit()


@router.get("/top-languages-by-stars")
def fetch_top_languages_by_repo_stars(
    username: str = Query(..., min_length=1),
    per_page: int = Query(100, ge=1, le=100),
    page: int = Query(1, ge=1),
):
    """Fetch top languages weighted by repo stars."""
    return github_search_controller.fetch_top_languages_by_repo_stars(
        username=username,
        per_page=per_page,
        page=page,
    )


@router.get("/year-summary")
def fetch_year_summary(
    username: str = Query(..., min_length=1),
    since: str = Query(DEFAULT_START_DATE, min_length=1),
    until: str = Query(DEFAULT_END_DATE, min_length=1),
):
    """Fetch year summary counts for commits, issues, PRs, and reviews."""
    return github_search_controller.fetch_year_summary_cards(
        username=username,
        since=since,
        until=until,
    )
