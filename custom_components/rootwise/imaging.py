"""Turn an uploaded picture into a clean JPEG and a thumbnail (blocking: executor).

Whatever comes in, a phone photo with its GPS position in EXIF, a PNG or a
WebP, what is stored is decoded and encoded again: upright, at most 1600 px
on the long side, without any metadata. Transparency becomes white.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import TYPE_CHECKING, Final

if TYPE_CHECKING:
    from PIL import Image as PILImage

MAX_SIDE: Final = 1600
THUMB_SIDE: Final = 400
# Checked from the header before decoding: guards a Pi against image bombs.
MAX_PIXELS = 50_000_000
FORMATS: Final = frozenset({"JPEG", "PNG", "WEBP"})


class ImageError(ValueError):
    """Not a picture Rootwise can take."""


class UnsupportedImage(ImageError):
    """A picture, but in a format Rootwise does not take (GIF, HEIC, ...)."""


class TooLargeImage(ImageError):
    """More pixels than a Pi should decode."""


@dataclass(frozen=True, slots=True)
class CleanImage:
    """The stored picture and its thumbnail, both JPEG."""

    full: bytes
    thumb: bytes
    width: int
    height: int


def _jpeg(image: PILImage.Image, quality: int) -> bytes:
    # Pillow only writes EXIF or an ICC profile when asked to; clearing info
    # makes sure nothing of the original travels along.
    image.info.clear()
    buffer = BytesIO()
    image.save(buffer, "JPEG", quality=quality, optimize=True, progressive=True)
    return buffer.getvalue()


def _flatten(image: PILImage.Image) -> PILImage.Image:
    from PIL import Image  # noqa: PLC0415

    transparent = image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    )
    if not transparent:
        return image.convert("RGB")
    rgba = image.convert("RGBA")
    background = Image.new("RGB", rgba.size, (255, 255, 255))
    background.paste(rgba, mask=rgba.getchannel("A"))
    return background


def clean_image(data: bytes) -> CleanImage:
    """Check, rotate, shrink and re-encode a picture."""
    from PIL import Image, ImageOps, UnidentifiedImageError  # noqa: PLC0415

    try:
        with Image.open(BytesIO(data)) as probe:
            if probe.format not in FORMATS:
                raise UnsupportedImage(str(probe.format))
            width, height = probe.size
            if width * height > MAX_PIXELS:
                raise TooLargeImage(f"{width}x{height}")
            probe.verify()
        with Image.open(BytesIO(data)) as original:
            image = _flatten(ImageOps.exif_transpose(original))
    except ImageError:
        raise
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as err:
        raise ImageError(str(err)) from err
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    thumb = image.copy()
    thumb.thumbnail((THUMB_SIDE, THUMB_SIDE), Image.Resampling.LANCZOS)
    return CleanImage(
        full=_jpeg(image, 85),
        thumb=_jpeg(thumb, 80),
        width=image.width,
        height=image.height,
    )
