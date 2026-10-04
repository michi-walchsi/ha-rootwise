"""Pictures for the photo tests, made with Pillow."""

from io import BytesIO

from PIL import Image

ORIENTATION = 0x0112
GPS_IFD = 0x8825
GPS = {1: "N", 2: (48.0, 12.0, 0.0), 3: "E", 4: (16.0, 22.0, 0.0)}


def jpeg(
    width: int, height: int, *, orientation: int | None = None, gps: bool = False
) -> bytes:
    """A green JPEG, optionally with EXIF orientation and a GPS position."""
    image = Image.new("RGB", (width, height), (40, 120, 60))
    exif = Image.Exif()
    if orientation:
        exif[ORIENTATION] = orientation
    if gps:
        exif[GPS_IFD] = GPS
    buffer = BytesIO()
    image.save(buffer, "JPEG", exif=exif.tobytes())
    return buffer.getvalue()


def png_half_transparent(size: int = 100) -> bytes:
    """Left half transparent, right half opaque red."""
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    image.paste((220, 20, 20, 255), (size // 2, 0, size, size))
    buffer = BytesIO()
    image.save(buffer, "PNG")
    return buffer.getvalue()


def gif() -> bytes:
    """A format Rootwise does not take."""
    buffer = BytesIO()
    Image.new("P", (10, 10)).save(buffer, "GIF")
    return buffer.getvalue()


def opened(data: bytes) -> Image.Image:
    """Open stored bytes again."""
    return Image.open(BytesIO(data))
