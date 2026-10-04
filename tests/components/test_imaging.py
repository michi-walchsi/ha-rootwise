"""Uploaded pictures become clean JPEGs: upright, small, without metadata."""

import pytest

from custom_components.rootwise import imaging
from custom_components.rootwise.imaging import (
    ImageError,
    TooLargeImage,
    UnsupportedImage,
    clean_image,
)

from .images import GPS_IFD, gif, jpeg, opened, png_half_transparent


def test_turns_upright_and_shrinks() -> None:
    clean = clean_image(jpeg(2000, 1000, orientation=6))
    assert (clean.width, clean.height) == (800, 1600)
    full = opened(clean.full)
    assert (full.format, full.size) == ("JPEG", (800, 1600))
    assert max(opened(clean.thumb).size) == 400


def test_keeps_no_metadata() -> None:
    original = jpeg(400, 300, orientation=6, gps=True)
    assert opened(original).getexif().get_ifd(GPS_IFD)  # the test picture has GPS
    clean = clean_image(original)
    for data in (clean.full, clean.thumb):
        image = opened(data)
        assert len(image.getexif()) == 0
        assert "exif" not in image.info
        assert "icc_profile" not in image.info


def test_small_pictures_stay_as_they_are() -> None:
    clean = clean_image(jpeg(640, 480))
    assert (clean.width, clean.height) == (640, 480)


def test_transparency_becomes_white() -> None:
    image = opened(clean_image(png_half_transparent()).full).convert("RGB")
    assert min(image.getpixel((10, 50))) > 235
    red, green, _ = image.getpixel((90, 50))
    assert red > 190
    assert green < 70


def test_gif_is_not_taken() -> None:
    with pytest.raises(UnsupportedImage):
        clean_image(gif())


def test_garbage_is_not_a_picture() -> None:
    with pytest.raises(ImageError):
        clean_image(b"certainly not a picture")


def test_a_cut_off_picture_is_refused() -> None:
    data = jpeg(400, 300)
    with pytest.raises(ImageError):
        clean_image(data[: len(data) // 2])


def test_too_many_pixels(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(imaging, "MAX_PIXELS", 1000)
    with pytest.raises(TooLargeImage):
        clean_image(jpeg(100, 100))
