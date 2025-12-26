from __future__ import annotations

import sys
from pathlib import Path


def standardize_sys_path() -> Path:
    """
    Keep stdlib ahead of project paths to avoid shadowing.
    Returns the detected repository root.
    """
    server_root = Path(__file__).resolve().parents[1]
    repo_root = server_root.parent

    repo_root_str = str(repo_root)
    server_root_str = str(server_root)

    if repo_root_str not in sys.path:
        sys.path.insert(0, repo_root_str)

    if server_root_str not in sys.path:
        sys.path.insert(1, server_root_str)

    if "" in sys.path:
        sys.path.remove("")
        sys.path.append("")

    return repo_root
