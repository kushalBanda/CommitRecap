"""GitHub search controller functions."""

from __future__ import annotations

import calendar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from fastapi import HTTPException
from server.config.env import Environment

GITHUB_BASE_URL = Environment.GITHUB_BASE_URL
GITHUB_TOKEN = Environment.GITHUB_TOKEN
DEFAULT_START_DATE = Environment.START_DATE
DEFAULT_END_DATE = Environment.END_DATE


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


def _post_graphql(query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
    """Call GitHub GraphQL API and return the parsed JSON response."""
    response = requests.post(
        f"{GITHUB_BASE_URL}/graphql",
        headers=_build_headers(),
        json={"query": query, "variables": variables},
        timeout=30,
    )
    if not response.ok:
        detail = response.json() if response.content else {"message": "GitHub API error"}
        raise HTTPException(status_code=response.status_code, detail=detail)
    payload = response.json()
    if payload.get("errors"):
        raise HTTPException(status_code=400, detail=payload["errors"])
    return payload["data"]


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


def fetch_repo_focus_and_collaboration(
    username: str,
    since: str,
    until: str,
    per_page: int,
    max_pages: int,
    top_n: int,
    max_workers: int,
) -> Dict[str, Any]:
    """Return top repos by commits and distinct repo count for a date range."""
    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          commitContributionsByRepository(maxRepositories: 100) {
            repository { nameWithOwner }
            contributions { totalCount }
          }
        }
      }
    }
    """
    data = _post_graphql(query, {"login": username, "from": since, "to": until})
    collection = (
        data.get("user", {}).get("contributionsCollection", {}) if data else {}
    )
    total_commits = collection.get("totalCommitContributions", 0)
    repos = collection.get("commitContributionsByRepository", [])
    ranked = sorted(
        (
            {
                "repo": repo.get("repository", {}).get("nameWithOwner"),
                "commit_count": repo.get("contributions", {}).get("totalCount", 0),
            }
            for repo in repos
            if repo.get("repository", {}).get("nameWithOwner")
        ),
        key=lambda entry: entry["commit_count"],
        reverse=True,
    )

    return {
        "username": username,
        "since": since,
        "until": until,
        "total_commits": total_commits,
        "unique_repos": len(ranked),
        "top_repos": ranked[:top_n],
        "source": "graphql",
        "per_page": per_page,
        "max_pages": max_pages,
        "max_workers": max_workers,
        "incomplete_results": False,
        "truncated": False,
    }


def fetch_commit_count_monthly_2025(username: str) -> Dict[str, Any]:
    """Return commit counts per month for 2025 for a user."""
    year_str = DEFAULT_START_DATE.split("T", 1)[0].split("-", 1)[0]
    year = int(year_str) if year_str.isdigit() else 2025
    month_aliases = []
    for month in range(1, 13):
        last_day = calendar.monthrange(year, month)[1]
        since = f"{year}-{month:02d}-01T00:00:00Z"
        until = f"{year}-{month:02d}-{last_day:02d}T23:59:59Z"
        alias = f"m{month:02d}"
        month_aliases.append(
            f"""{alias}: contributionsCollection(from: "{since}", to: "{until}") {{
              totalCommitContributions
            }}"""
        )
    query = f"""
    query($login: String!) {{
      user(login: $login) {{
        {" ".join(month_aliases)}
      }}
    }}
    """
    data = _post_graphql(query, {"login": username})
    user = data.get("user", {}) if data else {}
    monthly_counts = {}
    for month in range(1, 13):
        alias = f"m{month:02d}"
        monthly_counts[f"{year}-{month:02d}"] = (
            user.get(alias, {}).get("totalCommitContributions", 0)
        )

    return {
        "username": username,
        "year": year,
        "monthly_counts": monthly_counts,
        "source": "graphql",
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


def fetch_user_summary(username: str) -> Dict[str, Any]:
    """Return a summary of public user profile stats."""
    response = _get(f"/users/{username}", {})
    return {
        "login": response.get("login"),
        "name": response.get("name"),
        "company": response.get("company"),
        "blog": response.get("blog"),
        "location": response.get("location"),
        "public_repos": response.get("public_repos", 0),
        "public_gists": response.get("public_gists", 0),
        "followers": response.get("followers", 0),
        "following": response.get("following", 0),
        "created_at": response.get("created_at"),
        "updated_at": response.get("updated_at"),
    }


def fetch_rate_limit() -> Dict[str, Any]:
    """Return current rate limit status for the authenticated token."""
    response = _get("/rate_limit", {})
    resources = response.get("resources", {})
    return {
        "core": resources.get("core", {}),
        "search": resources.get("search", {}),
        "graphql": resources.get("graphql", {}),
    }


def fetch_top_languages_by_repo_stars(
    username: str,
    per_page: int,
    page: int,
) -> Dict[str, Any]:
    """Return language totals weighted by repo stars for a user."""
    repos_params = {"per_page": per_page, "page": page, "sort": "stars"}
    repos = _get(f"/users/{username}/repos", repos_params)

    language_stars: dict[str, int] = {}
    language_repo_counts: dict[str, int] = {}
    for repo in repos:
        language = repo.get("language")
        if not language:
            continue
        stars = int(repo.get("stargazers_count", 0))
        language_stars[language] = language_stars.get(language, 0) + stars
        language_repo_counts[language] = language_repo_counts.get(language, 0) + 1

    ranked = sorted(
        (
            {
                "language": language,
                "stars": stars,
                "repo_count": language_repo_counts.get(language, 0),
            }
            for language, stars in language_stars.items()
        ),
        key=lambda item: item["stars"],
        reverse=True,
    )

    return {
        "username": username,
        "page": page,
        "per_page": per_page,
        "languages": ranked,
    }
