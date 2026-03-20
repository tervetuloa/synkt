from __future__ import annotations

"""Thread-safe registry for active tool mocks."""

from threading import RLock
from typing import Any


class MockRegistry:
    """Registry for active tool mocks."""

    def __init__(self) -> None:
        self._mocks: dict[str, dict[str, Any]] = {}
        self._lock = RLock()

    def register(self, tool_name: str, return_value: Any = None, side_effect: Any = None) -> None:
        """Register a mock for a tool."""
        with self._lock:
            self._mocks[tool_name] = {
                "return_value": return_value,
                "side_effect": side_effect,
            }

    def get(self, tool_name: str) -> dict[str, Any] | None:
        """Get mock config for a tool, or None if not mocked."""
        with self._lock:
            return self._mocks.get(tool_name)

    def unregister(self, tool_name: str) -> None:
        """Remove a mock from the registry."""
        with self._lock:
            self._mocks.pop(tool_name, None)

    def clear(self) -> None:
        """Clear all mocks."""
        with self._lock:
            self._mocks.clear()


_mock_registry = MockRegistry()


def get_mock_registry() -> MockRegistry:
    return _mock_registry
