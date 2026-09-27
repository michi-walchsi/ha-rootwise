"""Minimal Home Assistant WebSocket client for the dev tools (no extra packages).

Reads HA_URL (e.g. https://<host>.ts.net or http://homeassistant.local:8123) and
HA_TOKEN (Profile -> Security -> Long-lived access tokens) from the environment.
The token is never printed or written to disk.
"""

from __future__ import annotations

import os
import sys
from typing import Any

import aiohttp


class HAWebSocket:
    """Authenticated request/response helper."""

    def __init__(self) -> None:
        url = os.environ.get("HA_URL", "").rstrip("/")
        token = os.environ.get("HA_TOKEN", "")
        if not url or not token:
            sys.exit("Set HA_URL and HA_TOKEN first (see the docstring).")
        self._url = url.replace("http", "ws", 1) + "/api/websocket"
        self._token = token
        self._session: aiohttp.ClientSession | None = None
        self._ws: aiohttp.ClientWebSocketResponse | None = None
        self._next_id = 1

    async def __aenter__(self) -> HAWebSocket:
        self._session = aiohttp.ClientSession()
        self._ws = await self._session.ws_connect(self._url, max_msg_size=0)
        await self._ws.receive_json()  # auth_required
        await self._ws.send_json({"type": "auth", "access_token": self._token})
        reply = await self._ws.receive_json()
        if reply.get("type") != "auth_ok":
            sys.exit("Authentication failed. Check HA_TOKEN.")
        return self

    async def __aexit__(self, *exc: object) -> None:
        if self._ws:
            await self._ws.close()
        if self._session:
            await self._session.close()

    async def call(self, msg_type: str, **payload: Any) -> Any:
        """Send one command and return its result (raises on error)."""
        assert self._ws is not None
        msg_id = self._next_id
        self._next_id += 1
        await self._ws.send_json({"id": msg_id, "type": msg_type, **payload})
        while True:
            reply = await self._ws.receive_json()
            if reply.get("id") != msg_id:
                continue
            if not reply.get("success", False):
                raise RuntimeError(f"{msg_type} failed: {reply.get('error')}")
            return reply.get("result")
