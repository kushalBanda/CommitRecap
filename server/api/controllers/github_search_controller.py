"""GitHub search controller functions."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from fastapi import HTTPException
from server.config.env import Environment

GITHUB_BASE_URL = Environment.GITHUB_BASE_URL
GITHUB_TOKEN = Environment.GITHUB_TOKEN


def _build_headers(accept: str | None = None) -> Dict[str, str]:
    """Build request headers for GitHub API calls."""
    headers = {
        "Accept": accept or "application/vnd.github+json",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def _get(path: str, params: Dict[str, Any], accept: str | None = None) -> Dict[str, Any]:
    """Call GitHub API and return the parsed JSON response."""
    url = f"{GITHUB_BASE_URL}{path}"
    response = requests.get(url, headers=_build_headers(accept), params=params, timeout=30)
    if not response.ok:
        detail = response.json() if response.content else {"message": "GitHub API error"}
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()


def _parse_github_datetime(value: str) -> Optional[datetime]:
    """Parse GitHub ISO-8601 datetimes safely."""
    if not value:
        return None
    try:
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _is_within_range(value: str, since: str, until: str) -> bool:
    """Check if a datetime string falls within an inclusive range."""
    parsed_value = _parse_github_datetime(value)
    parsed_since = _parse_github_datetime(since)
    parsed_until = _parse_github_datetime(until)

    if not parsed_value or not parsed_since or not parsed_until:
        return False

    if parsed_value.tzinfo is None:
        parsed_value = parsed_value.replace(tzinfo=timezone.utc)
    if parsed_since.tzinfo is None:
        parsed_since = parsed_since.replace(tzinfo=timezone.utc)
    if parsed_until.tzinfo is None:
        parsed_until = parsed_until.replace(tzinfo=timezone.utc)

    return parsed_since <= parsed_value <= parsed_until


def search_issues_by_author_date(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return total issue count authored by a user within a date range."""
    query = f"author:{username} type:issue created:{since}..{until}"
    params = {"q": query, "per_page": 1, "page": 1}
    response = _get("/search/issues", params)
    return {"total_count": response.get("total_count", 0)}


def search_prs_by_author_date(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return total PR count authored by a user within a date range."""
    query = f"author:{username} type:pr created:{since}..{until}"
    params = {"q": query, "per_page": 1, "page": 1}
    response = _get("/search/issues", params)
    return {"total_count": response.get("total_count", 0)}


def search_prs_reviewed_by_user_date(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return total PR count reviewed by a user within a date range."""
    query = f"reviewed-by:{username} type:pr reviewed:{since}..{until}"
    params = {"q": query, "per_page": 1, "page": 1}
    response = _get("/search/issues", params)
    return {"total_count": response.get("total_count", 0)}


def search_merged_prs_by_author_date(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return total merged PR count authored by a user within a date range."""
    query = f"author:{username} type:pr is:merged merged:{since}..{until}"
    params = {"q": query, "per_page": 1, "page": 1}
    response = _get("/search/issues", params)
    return {"total_count": response.get("total_count", 0)}


def fetch_commit_count(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return the total commit count authored by a user within a date range."""
    query = f"author:{username} author-date:{since}..{until}"
    params = {"q": query, "per_page": 1, "page": 1}
    response = _get("/search/commits", params)
    return {
        "username": username,
        "since": since,
        "until": until,
        "commit_count": response.get("total_count", 0),
        "incomplete_results": response.get("incomplete_results", False),
    }


def fetch_most_used_languages(
    username: str,
    per_page: int,
    page: int,
) -> Dict[str, Any]:
    """
    Aggregate language usage for repos.
    Returns total bytes and usage percentages across matching repos.
    """
    repos_params = {"per_page": per_page, "page": page, "sort": "updated"}
    repos = _get(f"/users/{username}/repos", repos_params)

    language_totals: dict[str, int] = {}
    for repo in repos:
        owner = repo.get("owner", {}).get("login")
        name = repo.get("name")
        if not owner or not name:
            continue

        languages = _get(f"/repos/{owner}/{name}/languages", {})
        for language, bytes_count in languages.items():
            language_totals[language] = language_totals.get(language, 0) + bytes_count

    total_bytes = sum(language_totals.values())
    percentages: dict[str, float] = {}
    if total_bytes > 0:
        for language, bytes_count in language_totals.items():
            percentages[language] = round((bytes_count / total_bytes) * 100, 2)

    return {
        "username": username,
        "page": page,
        "per_page": per_page,
        "total_bytes": total_bytes,
        "languages": language_totals,
        "percentages": percentages,
    }


def fetch_repo_count(
    username: str,
    per_page: int,
    page: int,
) -> Dict[str, Any]:
    """Return total repo count for a user."""
    response = _get(f"/users/{username}", {})
    return {
        "username": username,
        "page": page,
        "per_page": per_page,
        "repo_count": response.get("public_repos", 0),
    }
