"""Shared test setup."""

import sys

import pytest

if sys.platform == "win32":
    # Local Windows development only: asyncio needs an AF_INET socketpair for its
    # self-pipe, which pytest-socket would block. CI runs on Linux with the guard.
    import pytest_socket

    pytest_socket.disable_socket = lambda *args, **kwargs: None


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Allow loading custom_components/rootwise in every test."""
    return
