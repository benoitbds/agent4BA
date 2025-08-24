from __future__ import annotations

from typing import Any


def record_run_step(run_id: int, action: str, payload: dict[str, Any]) -> None:
    """Placeholder for audit logging of tool usage.

    In tests this is a no-op to keep focus on handler logic.
    """
    return None
