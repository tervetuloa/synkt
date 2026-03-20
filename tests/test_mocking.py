from __future__ import annotations

import pytest

from synkt import mock_tool
from synkt.mocking._registry import get_mock_registry


def test_mock_tool_basic_return_value() -> None:
    """Test basic mock registration with return_value."""
    registry = get_mock_registry()

    with mock_tool("my_tool", return_value="mocked_response"):
        mock_config = registry.get("my_tool")
        assert mock_config is not None
        assert mock_config["return_value"] == "mocked_response"

    assert registry.get("my_tool") is None


def test_mock_tool_side_effect() -> None:
    """Test mock registration with side_effect callable."""

    def custom_behavior(x: int) -> int:
        return x * 2

    registry = get_mock_registry()
    with mock_tool("calculator", side_effect=custom_behavior):
        mock_config = registry.get("calculator")
        assert mock_config is not None
        assert mock_config["side_effect"] is custom_behavior
        assert mock_config["side_effect"](5) == 10

    assert registry.get("calculator") is None


def test_mock_tool_cleanup_on_exception() -> None:
    """Test mocks are cleaned up even when the context exits via exception."""
    registry = get_mock_registry()

    with pytest.raises(ValueError):
        with mock_tool("error_tool", return_value="should_cleanup"):
            assert registry.get("error_tool") is not None
            raise ValueError("Test error")

    assert registry.get("error_tool") is None


def test_multiple_mocks_same_context() -> None:
    """Test multiple tools can be mocked at once and both are cleaned up."""
    registry = get_mock_registry()

    with mock_tool("tool1", return_value="mock1"), mock_tool("tool2", return_value="mock2"):
        assert registry.get("tool1") is not None
        assert registry.get("tool2") is not None
        assert registry.get("tool1")["return_value"] == "mock1"
        assert registry.get("tool2")["return_value"] == "mock2"

    assert registry.get("tool1") is None
    assert registry.get("tool2") is None
