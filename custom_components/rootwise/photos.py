"""Plant photos: files under the media folder, served only with a login.

A photo is a journal entry of type "photo"; its files live in
<media>/rootwise/<plant_id>/<photo_id>.jpg and .thumb.jpg, so they also show
up under "My media". Static paths would be readable without a login, so the
views read the files themselves and the panel fetches them with the user's
token. Folders of removed plants move to _archive instead of vanishing.
"""

from __future__ import annotations

from http import HTTPStatus
import logging
import os
from pathlib import Path
import re
import shutil
from typing import TYPE_CHECKING, Final

from aiohttp import BodyPartReader, web
from homeassistant.components.http.const import KEY_HASS_USER
from homeassistant.core import HomeAssistant
from homeassistant.helpers.http import KEY_HASS, HomeAssistantView

from .const import DOMAIN
from .imaging import ImageError, TooLargeImage, UnsupportedImage, clean_image
from .permissions import may_log

if TYPE_CHECKING:
    from .hub import RootwiseHub
    from .imaging import CleanImage

_LOGGER = logging.getLogger(__name__)

FOLDER: Final = "rootwise"
ARCHIVE: Final = "_archive"
# The panel sends ~0.5 MB; a gallery original that could not be shrunk in
# the browser may be bigger.
MAX_UPLOAD = 15 * 1024 * 1024
CHUNK: Final = 64 * 1024
NOTE_LENGTH: Final = 500
# Photo and plant ids are ULIDs: nothing else ever becomes part of a path.
ULID: Final = re.compile(r"[0-9A-Z]{26}")
CACHE: Final = "private, max-age=31536000, immutable"


def photo_root(hass: HomeAssistant) -> Path:
    """Return <media>/rootwise."""
    base = hass.config.media_dirs.get("local") or hass.config.path("media")
    return Path(base) / FOLDER


def photo_file(
    hass: HomeAssistant, plant_id: str, photo_id: str, *, thumb: bool = False
) -> Path:
    """Return the path of a photo or its thumbnail."""
    suffix = ".thumb.jpg" if thumb else ".jpg"
    return photo_root(hass) / plant_id / f"{photo_id}{suffix}"


def _write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_bytes(data)
    os.replace(temporary, path)


def write_photo(
    hass: HomeAssistant, plant_id: str, photo_id: str, clean: CleanImage
) -> None:
    """Store a photo and its thumbnail (blocking)."""
    _write(photo_file(hass, plant_id, photo_id), clean.full)
    _write(photo_file(hass, plant_id, photo_id, thumb=True), clean.thumb)


def delete_photo(hass: HomeAssistant, plant_id: str, photo_id: str) -> None:
    """Remove a photo and its thumbnail (blocking)."""
    for thumb in (False, True):
        photo_file(hass, plant_id, photo_id, thumb=thumb).unlink(missing_ok=True)


def archive_folders(root: Path, keep: set[str]) -> list[str]:
    """Move photo folders of plants that are gone to _archive (blocking)."""
    if not root.is_dir():
        return []
    moved = []
    for folder in root.iterdir():
        if (
            not folder.is_dir()
            or not ULID.fullmatch(folder.name)
            or folder.name in keep
        ):
            continue
        target = root / ARCHIVE / folder.name
        target.mkdir(parents=True, exist_ok=True)
        for file in folder.iterdir():
            shutil.move(file, target / file.name)
        folder.rmdir()
        moved.append(folder.name)
    return moved


class _UploadError(Exception):
    def __init__(self, status: HTTPStatus, message: str) -> None:
        super().__init__(message)
        self.status = status


async def _read_form(request: web.Request) -> tuple[bytes, str | None]:
    """Return the file and the note from a multipart upload, size-checked."""
    if (
        request.content_length is not None
        and request.content_length > MAX_UPLOAD + CHUNK
    ):
        raise _UploadError(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "Photo too large")
    try:
        reader = await request.multipart()
    except (AssertionError, LookupError, ValueError) as err:
        raise _UploadError(HTTPStatus.BAD_REQUEST, "Expected a form upload") from err
    data: bytes | None = None
    note: str | None = None
    while (part := await reader.next()) is not None:
        if not isinstance(part, BodyPartReader):
            continue
        if part.name == "file":
            buffer = bytearray()
            while chunk := await part.read_chunk(CHUNK):
                buffer += chunk
                if len(buffer) > MAX_UPLOAD:
                    raise _UploadError(
                        HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "Photo too large"
                    )
            data = bytes(buffer)
        elif part.name == "note":
            note = (await part.text()).strip()[:NOTE_LENGTH] or None
    if not data:
        raise _UploadError(HTTPStatus.BAD_REQUEST, "No photo in the upload")
    return data, note


def _hub(hass: HomeAssistant) -> RootwiseHub | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


class PhotoUploadView(HomeAssistantView):
    """POST a photo of a plant (multipart: file, optional note)."""

    url = "/api/rootwise/photos/{plant_id}"
    name = "api:rootwise:photo_upload"

    async def post(self, request: web.Request, plant_id: str) -> web.Response:
        """Check, clean, store and log the photo."""
        hass = request.app[KEY_HASS]
        hub = _hub(hass)
        plant = hub.plants.get(plant_id) if hub else None
        if hub is None or plant is None:
            return self.json_message("Unknown plant", HTTPStatus.NOT_FOUND)
        user = request[KEY_HASS_USER]
        if not may_log(hass, user, hub, plant_id):
            return self.json_message("Not allowed", HTTPStatus.FORBIDDEN)
        try:
            data, note = await _read_form(request)
            # One at a time: decoding a photo takes a Pi a moment and memory.
            async with hub.photo_lock:
                clean = await hass.async_add_executor_job(clean_image, data)
                entry = await plant.async_add_photo(clean, note=note, user_id=user.id)
        except _UploadError as err:
            return self.json_message(str(err), err.status)
        except TooLargeImage:
            return self.json_message(
                "Too many pixels", HTTPStatus.REQUEST_ENTITY_TOO_LARGE
            )
        except UnsupportedImage:
            return self.json_message(
                "Use JPEG, PNG or WebP", HTTPStatus.UNSUPPORTED_MEDIA_TYPE
            )
        except ImageError:
            return self.json_message("Not a picture", HTTPStatus.BAD_REQUEST)
        return self.json({"entry": entry})


class PhotoView(HomeAssistantView):
    """GET a photo (?size=thumb for the thumbnail)."""

    url = "/api/rootwise/photos/{plant_id}/{photo_id}"
    name = "api:rootwise:photo"

    async def get(
        self, request: web.Request, plant_id: str, photo_id: str
    ) -> web.StreamResponse:
        """Send the file if it belongs to a photo entry of the plant."""
        hass = request.app[KEY_HASS]
        hub = _hub(hass)
        plant = hub.plants.get(plant_id) if hub else None
        if (
            plant is None
            or not ULID.fullmatch(photo_id)
            or plant.photo_entry(photo_id) is None
        ):
            return self.json_message("Unknown photo", HTTPStatus.NOT_FOUND)
        thumb = request.query.get("size") == "thumb"
        path = photo_file(hass, plant_id, photo_id, thumb=thumb)
        if not await hass.async_add_executor_job(path.is_file):
            return self.json_message("Unknown photo", HTTPStatus.NOT_FOUND)
        return web.FileResponse(
            path,
            headers={
                "Content-Type": "image/jpeg",
                "Cache-Control": CACHE,
                "X-Content-Type-Options": "nosniff",
            },
        )


def async_register_views(hass: HomeAssistant) -> None:
    """Register the photo views once per run."""
    if hass.http is None:
        return
    hass.http.register_view(PhotoUploadView())
    hass.http.register_view(PhotoView())
