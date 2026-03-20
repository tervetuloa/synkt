"""Example: Mocking tool responses in tests."""

from __future__ import annotations

from synkt import mock_tool


def test_weather_agent_with_mocked_api() -> None:
    """Test weather agent without calling a real weather API."""
    with mock_tool("get_weather", return_value="sunny and 72F"):
        # Your agent workflow runs here.
        # When it calls get_weather(), it receives the mocked response.
        pass


def test_refund_agent_with_conditional_logic() -> None:
    """Test refund logic with amount-dependent behavior."""

    def mock_refund(order_id: str, amount: float) -> dict[str, str]:
        if amount > 100:
            return {"status": "requires_approval"}
        return {"status": "approved"}

    with mock_tool("process_refund", side_effect=mock_refund):
        # Test different scenarios.
        pass
