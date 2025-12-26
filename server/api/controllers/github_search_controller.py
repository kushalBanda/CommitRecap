"""GitHub search controller functions."""

from __future__ import annotations

import calendar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from fastapi import HTTPException
from config.env import Environment

GITHUB_BASE_URL = Environment.GITHUB_BASE_URL
GITHUB_TOKEN = Environment.GITHUB_TOKEN
DEFAULT_START_DATE = Environment.START_DATE or "2025-01-01"
DEFAULT_END_DATE = Environment.END_DATE or "2025-12-31"


def _normalize_datetime(value: str, default_time: str) -> str:
    if "T" in value:
        return value
    return f"{value}{default_time}"


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


def _percentile(sorted_values: list[int], percentile: float) -> int:
    if not sorted_values:
        return 0
    if percentile <= 0:
        return sorted_values[0]
    if percentile >= 100:
        return sorted_values[-1]
    index = (len(sorted_values) - 1) * (percentile / 100)
    lower = int(index)
    upper = min(lower + 1, len(sorted_values) - 1)
    if lower == upper:
        return sorted_values[lower]
    weight = index - lower
    return int(sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight)


def _build_commit_size_story(stats: Dict[str, Any]) -> str:
    if stats["count"] == 0:
        return "No commits found in the selected window."
    median = stats["median"]
    p90 = stats["p90"]
    avg = stats["average"]
    if median <= 20 and p90 <= 120:
        tone = "Mostly small, steady commits with occasional medium pushes."
    elif median <= 60 and p90 <= 300:
        tone = "Balanced mix of routine commits and periodic larger changes."
    elif median <= 120 and p90 <= 600:
        tone = "Frequent medium-to-large commits; bigger change sets show up often."
    else:
        tone = "Large, chunky commits dominate the period."
    if avg > median * 1.6:
        tail = "A few very large commits skew the average upward."
    else:
        tail = "Commit sizes stay relatively consistent."
    return f"{tone} {tail}"


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
    since_dt = _normalize_datetime(since, "T00:00:00Z")
    until_dt = _normalize_datetime(until, "T23:59:59Z")
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
    data = _post_graphql(query, {"login": username, "from": since_dt, "to": until_dt})
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


def fetch_commit_size_distribution(
    username: str,
    since: str,
    until: str,
    top_repos: int,
    max_commits_per_repo: int,
) -> Dict[str, Any]:
    """Return commit size distribution and a short narrative."""
    since_dt = _normalize_datetime(since, "T00:00:00Z")
    until_dt = _normalize_datetime(until, "T23:59:59Z")

    user_query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        id
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              defaultBranchRef { name }
            }
            contributions { totalCount }
          }
        }
      }
    }
    """
    user_data = _post_graphql(
        user_query, {"login": username, "from": since_dt, "to": until_dt}
    )
    user = user_data.get("user", {}) if user_data else {}
    user_id = user.get("id")
    repos = (
        user.get("contributionsCollection", {}).get("commitContributionsByRepository", [])
    )
    ranked_repos = sorted(
        (
            {
                "repo": repo.get("repository", {}).get("nameWithOwner"),
                "default_branch": repo.get("repository", {})
                .get("defaultBranchRef", {})
                .get("name"),
                "commit_count": repo.get("contributions", {}).get("totalCount", 0),
            }
            for repo in repos
            if repo.get("repository", {}).get("nameWithOwner")
        ),
        key=lambda entry: entry["commit_count"],
        reverse=True,
    )[:top_repos]

    history_query = """
    query(
      $repo_owner: String!,
      $repo_name: String!,
      $from: GitTimestamp,
      $until: GitTimestamp,
      $author: ID,
      $after: String
    ) {
      repository(owner: $repo_owner, name: $repo_name) {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 100, since: $from, until: $until, author: {id: $author}, after: $after) {
                nodes {
                  additions
                  deletions
                  changedFiles
                  committedDate
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        }
      }
    }
    """

    sizes: list[int] = []
    per_repo_counts: dict[str, int] = {}
    for repo_entry in ranked_repos:
        repo_full = repo_entry["repo"]
        if not repo_full or "/" not in repo_full:
            continue
        owner, name = repo_full.split("/", 1)
        collected = 0
        after = None
        while collected < max_commits_per_repo:
            data = _post_graphql(
                history_query,
                {
                    "repo_owner": owner,
                    "repo_name": name,
                    "from": since_dt,
                    "until": until_dt,
                    "author": user_id,
                    "after": after,
                },
            )
            history = (
                data.get("repository", {})
                .get("defaultBranchRef", {})
                .get("target", {})
                .get("history", {})
            )
            nodes = history.get("nodes", []) if history else []
            if not nodes:
                break
            for node in nodes:
                if collected >= max_commits_per_repo:
                    break
                additions = int(node.get("additions", 0))
                deletions = int(node.get("deletions", 0))
                sizes.append(additions + deletions)
                collected += 1
            page_info = history.get("pageInfo", {})
            if not page_info.get("hasNextPage"):
                break
            after = page_info.get("endCursor")
        if collected:
            per_repo_counts[repo_full] = collected

    sizes.sort()
    count = len(sizes)
    stats = {
        "count": count,
        "min": sizes[0] if sizes else 0,
        "max": sizes[-1] if sizes else 0,
        "median": _percentile(sizes, 50),
        "p75": _percentile(sizes, 75),
        "p90": _percentile(sizes, 90),
        "p95": _percentile(sizes, 95),
        "average": round(sum(sizes) / count, 2) if count else 0,
    }

    return {
        "username": username,
        "since": since,
        "until": until,
        "top_repos": top_repos,
        "max_commits_per_repo": max_commits_per_repo,
        "stats": stats,
        "per_repo_commit_counts": per_repo_counts,
        "story": _build_commit_size_story(stats),
        "source": "graphql",
    }


def fetch_most_used_languages(
    username: str,
    since: str,
    until: str,
    per_page: int,
    page: int,
) -> Dict[str, Any]:
    """
    Aggregate language usage for repos contributed to within a date range.
    Returns total bytes and usage percentages across matching repos.
    """
    since_dt = _normalize_datetime(since, "T00:00:00Z")
    until_dt = _normalize_datetime(until, "T23:59:59Z")

    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node { name }
                }
              }
            }
          }
        }
      }
    }
    """
    data = _post_graphql(query, {"login": username, "from": since_dt, "to": until_dt})
    repos = (
        data.get("user", {})
        .get("contributionsCollection", {})
        .get("commitContributionsByRepository", [])
    )

    language_totals: dict[str, int] = {}
    for repo in repos:
        edges = repo.get("repository", {}).get("languages", {}).get("edges", [])
        for edge in edges:
            language = edge.get("node", {}).get("name")
            bytes_count = edge.get("size", 0)
            if not language:
                continue
            language_totals[language] = language_totals.get(language, 0) + bytes_count

    total_bytes = sum(language_totals.values())
    percentages: dict[str, float] = {}
    if total_bytes > 0:
        for language, bytes_count in language_totals.items():
            percentages[language] = round((bytes_count / total_bytes) * 100, 2)

    return {
        "username": username,
        "since": since,
        "until": until,
        "page": page,
        "per_page": per_page,
        "total_bytes": total_bytes,
        "languages": language_totals,
        "percentages": percentages,
        "source": "graphql",
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
        "avatar_url": response.get("avatar_url"),
        "html_url": response.get("html_url"),
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


def fetch_year_summary_cards(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return year summary totals for commits, issues, PRs, and reviews."""
    since_dt = _normalize_datetime(since, "T00:00:00Z")
    until_dt = _normalize_datetime(until, "T23:59:59Z")

    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
      }
    }
    """
    data = _post_graphql(query, {"login": username, "from": since_dt, "to": until_dt})
    collection = (
        data.get("user", {}).get("contributionsCollection", {}) if data else {}
    )
    return {
        "username": username,
        "since": since,
        "until": until,
        "commits": collection.get("totalCommitContributions", 0),
        "issues": collection.get("totalIssueContributions", 0),
        "pull_requests": collection.get("totalPullRequestContributions", 0),
        "reviews": collection.get("totalPullRequestReviewContributions", 0),
        "source": "graphql",
    }


def fetch_contribution_heatmap(
    username: str,
    since: str,
    until: str,
) -> Dict[str, Any]:
    """Return contribution calendar heatmap for a date range."""
    since_dt = _normalize_datetime(since, "T00:00:00Z")
    until_dt = _normalize_datetime(until, "T23:59:59Z")

    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
    """
    data = _post_graphql(query, {"login": username, "from": since_dt, "to": until_dt})
    calendar_data = (
        data.get("user", {})
        .get("contributionsCollection", {})
        .get("contributionCalendar", {})
    )

    return {
        "username": username,
        "since": since,
        "until": until,
        "total_contributions": calendar_data.get("totalContributions", 0),
        "weeks": calendar_data.get("weeks", []),
        "source": "graphql",
    }
