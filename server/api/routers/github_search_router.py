"""GitHub search endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from server.api.controllers import github_search_controller

router = APIRouter(prefix="/github/search", tags=["github-search"])


@router.get("/issues")
def search_issues(
    username: str = Query(..., min_length=1),
    since: str = Query(..., min_length=1),
    until: str = Query(..., min_length=1),
):
    """Fetch total issue count authored by a user within a date range."""
    return github_search_controller.search_issues_by_author_date(
        username=username,
        since=since,
        until=until,
    )


@router.get("/prs")
def search_prs(
    username: str = Query(..., min_length=1),
    since: str = Query(..., min_length=1),
    until: str = Query(..., min_length=1),
):
    """Fetch total PR count authored by a user within a date range."""
    return github_search_controller.search_prs_by_author_date(
        username=username,
        since=since,
        until=until,
    )


@router.get("/prs-reviewed")
def search_prs_reviewed(
    username: str = Query(..., min_length=1),
    since: str = Query(..., min_length=1),
    until: str = Query(..., min_length=1),
):
    """Fetch total PR count reviewed by a user within a date range."""
    return github_search_controller.search_prs_reviewed_by_user_date(
        username=username,
        since=since,
        until=until,
    )


@router.get("/prs-merged")
def search_merged_prs(
    username: str = Query(..., min_length=1),
    since: str = Query(..., min_length=1),
    until: str = Query(..., min_length=1),
):
    """Fetch total merged PR count authored by a user within a date range."""
    return github_search_controller.search_merged_prs_by_author_date(
        username=username,
        since=since,
        until=until,
    )


@router.get("/commit-count")
def fetch_commit_count(
    username: str = Query(..., min_length=1),
    since: str = Query(..., min_length=1),
    until: str = Query(..., min_length=1),
):
    """Fetch total commit count authored by a user within a date range."""
    return github_search_controller.fetch_commit_count(
        username=username,
        since=since,
        until=until,
    )


@router.get("/languages")
def fetch_languages(
    username: str = Query(..., min_length=1),
    per_page: int = Query(100, ge=1, le=100),
    page: int = Query(1, ge=1),
):
    """Fetch repo languages."""
    return github_search_controller.fetch_most_used_languages(
        username=username,
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
