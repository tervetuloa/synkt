from __future__ import annotations

"""Mock tool responses for testing."""

from collections.abc import Callable
from contextlib import contextmanager
from typing import Any

from synkt.mocking._registry import get_mock_registry


@contextmanager
def mock_tool(
    tool_name: str,
    return_value: Any = None,
    side_effect: Callable[..., Any] | None = None,
):
    """
    Mock a tool's response during test execution.

    Args:
        tool_name: Name of the tool to mock.
        return_value: Static value to return when no side_effect is provided.
        side_effect: Function to call instead of the real tool.
    """
    registry = get_mock_registry()
    registry.register(tool_name, return_value=return_value, side_effect=side_effect)

    try:
        yield
    finally:
        registry.unregister(tool_name)
