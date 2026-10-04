"""Plant photos: upload, serving, cover picture, deleting, archiving."""

from http import HTTPStatus
from pathlib import Path
from unittest.mock import patch

from aiohttp import FormData
from freezegun.api import FrozenDateTimeFactory
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.const import STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from .conftest import Client, subentry_id
from .images import GPS_IFD, gif, jpeg, opened


@pytest.fixture(autouse=True)
async def media(hass: HomeAssistant, tmp_path: Path) -> Path:
    """Photos go to a temporary media folder; the views need http."""
    hass.config.media_dirs = {"local": str(tmp_path)}
    assert await async_setup_component(hass, "http", {})
    return tmp_path / "rootwise"


async def _upload(client, plant_id: str, data: bytes, note: str | None = None):
    form = FormData()
    form.add_field("file", data, filename="photo.jpg", content_type="image/jpeg")
    if note:
        form.add_field("note", note)
    return await client.post(f"/api/rootwise/photos/{plant_id}", data=form)


async def _plant(client: Client, name: str) -> dict:
    result = await client.result("rootwise/plants")
    return next(p for p in result["plants"] if p["name"] == name)


async def test_upload_stores_a_clean_photo_and_logs_it(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    media: Path,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    response = await _upload(
        http, plant_id, jpeg(2000, 1000, orientation=6, gps=True), note="Neues Blatt"
    )
    assert response.status == HTTPStatus.OK, await response.text()
    entry_json = (await response.json())["entry"]
    assert entry_json["type"] == "photo"
    assert entry_json["note"] == "Neues Blatt"
    data = entry_json["data"]
    assert (data["width"], data["height"]) == (800, 1600)

    full = media / plant_id / f"{data['photo_id']}.jpg"
    thumb = media / plant_id / f"{data['photo_id']}.thumb.jpg"
    stored = opened(full.read_bytes())
    assert stored.size == (800, 1600)
    assert not stored.getexif().get_ifd(GPS_IFD)
    assert max(opened(thumb.read_bytes()).size) == 400


async def test_the_newest_photo_is_the_cover_unless_one_is_chosen(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    client: Client,
    freezer: FrozenDateTimeFactory,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    assert (await _plant(client, "Monstera"))["photo"] is None

    first = (await (await _upload(http, plant_id, jpeg(300, 200))).json())["entry"]
    freezer.tick(60)
    second = (await (await _upload(http, plant_id, jpeg(300, 200))).json())["entry"]
    cover = (await _plant(client, "Monstera"))["photo"]
    assert cover["id"] == second["data"]["photo_id"]
    assert (cover["width"], cover["height"]) == (300, 200)

    await client.result(
        "rootwise/photos/cover", plant_id=plant_id, photo_id=first["data"]["photo_id"]
    )
    assert (await _plant(client, "Monstera"))["photo"]["id"] == first["data"][
        "photo_id"
    ]

    listed = await client.result("rootwise/photos/list", plant_id=plant_id)
    assert [p["photo_id"] for p in listed["photos"]] == [
        second["data"]["photo_id"],
        first["data"]["photo_id"],
    ]
    assert listed["cover"] == first["data"]["photo_id"]

    await client.result("rootwise/photos/cover", plant_id=plant_id, photo_id=None)
    assert (await _plant(client, "Monstera"))["photo"]["id"] == second["data"][
        "photo_id"
    ]


async def test_cover_must_be_a_photo_of_the_plant(
    hass: HomeAssistant, entry: MockConfigEntry, client: Client
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    response = await client.call(
        "rootwise/photos/cover",
        plant_id=plant_id,
        photo_id="01J00000000000000000000000",
    )
    assert response["error"]["code"] == "not_found"


async def test_photos_are_served_only_with_login(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    hass_client_no_auth: ClientSessionGenerator,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    photo_id = (await (await _upload(http, plant_id, jpeg(300, 200))).json())["entry"][
        "data"
    ]["photo_id"]
    url = f"/api/rootwise/photos/{plant_id}/{photo_id}"

    response = await http.get(url)
    assert response.status == HTTPStatus.OK
    assert response.headers["Content-Type"] == "image/jpeg"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert "private" in response.headers["Cache-Control"]
    assert opened(await response.read()).size == (300, 200)

    thumb = await http.get(f"{url}?size=thumb")
    assert thumb.status == HTTPStatus.OK

    anonymous = await hass_client_no_auth()
    assert (await anonymous.get(url)).status == HTTPStatus.UNAUTHORIZED
    # Home Assistant's own filter stops traversal; Rootwise only takes ULIDs.
    traversal = await http.get(f"/api/rootwise/photos/{plant_id}/..%2F..%2Fsecrets")
    assert traversal.status in (HTTPStatus.BAD_REQUEST, HTTPStatus.NOT_FOUND)
    not_an_id = await http.get(f"/api/rootwise/photos/{plant_id}/secrets")
    assert not_an_id.status == HTTPStatus.NOT_FOUND
    other = subentry_id(entry, "Efeutute")
    assert (await http.get(f"/api/rootwise/photos/{other}/{photo_id}")).status == (
        HTTPStatus.NOT_FOUND
    )


async def test_upload_refusals(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    hass_read_only_access_token: str,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    assert (await _upload(http, "nope", jpeg(10, 10))).status == HTTPStatus.NOT_FOUND
    assert (
        await _upload(http, plant_id, b"no picture")
    ).status == HTTPStatus.BAD_REQUEST
    assert (await _upload(http, plant_id, gif())).status == (
        HTTPStatus.UNSUPPORTED_MEDIA_TYPE
    )
    with patch("custom_components.rootwise.photos.MAX_UPLOAD", 1000):
        assert (await _upload(http, plant_id, jpeg(400, 300))).status == (
            HTTPStatus.REQUEST_ENTITY_TOO_LARGE
        )
    with patch("custom_components.rootwise.imaging.MAX_PIXELS", 100):
        assert (await _upload(http, plant_id, jpeg(400, 300))).status == (
            HTTPStatus.REQUEST_ENTITY_TOO_LARGE
        )
    empty = await http.post(f"/api/rootwise/photos/{plant_id}", data=FormData())
    assert empty.status == HTTPStatus.BAD_REQUEST

    read_only = await hass_client(hass_read_only_access_token)
    assert (await _upload(read_only, plant_id, jpeg(10, 10))).status == (
        HTTPStatus.FORBIDDEN
    )


async def test_household_members_may_upload(
    hass: HomeAssistant, entry: MockConfigEntry, hass_client: ClientSessionGenerator
) -> None:
    user = await hass.auth.async_create_user("Kind", group_ids=[GROUP_ID_USER])
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.com/")
    member = await hass_client(hass.auth.async_create_access_token(refresh))
    response = await _upload(member, subentry_id(entry, "Monstera"), jpeg(30, 20))
    assert response.status == HTTPStatus.OK
    assert (await response.json())["entry"]["user_id"] == user.id


async def test_deleting_the_entry_deletes_the_files(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    client: Client,
    media: Path,
) -> None:
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    logged = (await (await _upload(http, plant_id, jpeg(300, 200))).json())["entry"]
    photo_id = logged["data"]["photo_id"]
    await client.result("rootwise/photos/cover", plant_id=plant_id, photo_id=photo_id)

    await client.result("rootwise/care/delete", entry_id=logged["id"])
    await hass.async_block_till_done()

    assert list((media / plant_id).iterdir()) == []
    assert (await _plant(client, "Monstera"))["photo"] is None
    response = await http.get(f"/api/rootwise/photos/{plant_id}/{photo_id}")
    assert response.status == HTTPStatus.NOT_FOUND


async def test_photos_of_a_removed_plant_are_archived(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    media: Path,
) -> None:
    plant_id = subentry_id(entry, "Efeutute")
    http = await hass_client()
    assert (await _upload(http, plant_id, jpeg(30, 20))).status == HTTPStatus.OK

    assert hass.config_entries.async_remove_subentry(entry, plant_id)
    await hass.async_block_till_done()

    assert not (media / plant_id).exists()
    archived = media / "_archive" / plant_id
    assert len(list(archived.glob("*.jpg"))) == 2


async def test_cover_photo_is_an_image_entity(
    hass: HomeAssistant,
    entry: MockConfigEntry,
    hass_client: ClientSessionGenerator,
    client: Client,
    media: Path,
) -> None:
    assert hass.states.get("image.monstera_photo").state == STATE_UNKNOWN
    plant_id = subentry_id(entry, "Monstera")
    http = await hass_client()
    logged = (await (await _upload(http, plant_id, jpeg(300, 200))).json())["entry"]
    await hass.async_block_till_done()

    state = hass.states.get("image.monstera_photo")
    assert state.state == logged["ts"]
    picture = await http.get(state.attributes["entity_picture"])
    assert picture.status == HTTPStatus.OK
    stored = media / plant_id / f"{logged['data']['photo_id']}.jpg"
    assert await picture.read() == stored.read_bytes()

    await client.result("rootwise/care/delete", entry_id=logged["id"])
    await hass.async_block_till_done()
    assert hass.states.get("image.monstera_photo").state == STATE_UNKNOWN


async def test_upload_photo_action_takes_a_file(
    hass: HomeAssistant, entry: MockConfigEntry, tmp_path: Path, media: Path
) -> None:
    folder = tmp_path / "camera"
    folder.mkdir()
    picture = folder / "balkon.jpg"
    picture.write_bytes(jpeg(640, 480, gps=True))
    hass.config.allowlist_external_dirs = {str(folder)}

    await hass.services.async_call(
        "rootwise",
        "upload_photo",
        {
            "entity_id": "sensor.monstera_status",
            "file_path": str(picture),
            "note": "Von der Automation",
        },
        blocking=True,
    )

    plant = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    cover = plant.cover_photo
    assert cover["source"] == "service"
    assert cover["note"] == "Von der Automation"
    stored = media / plant.config.plant_id / f"{cover['data']['photo_id']}.jpg"
    assert not opened(stored.read_bytes()).getexif().get_ifd(GPS_IFD)


async def test_upload_photo_action_takes_a_camera_snapshot(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    with patch(
        "custom_components.rootwise.services._camera_image",
        return_value=jpeg(320, 240),
    ) as get_image:
        await hass.services.async_call(
            "rootwise",
            "upload_photo",
            {"entity_id": "sensor.monstera_status", "camera": "camera.balkon"},
            blocking=True,
        )
    assert get_image.call_args.args[1] == "camera.balkon"
    plant = entry.runtime_data.plants[subentry_id(entry, "Monstera")]
    assert plant.cover_photo["data"]["width"] == 320


async def test_upload_photo_action_refusals(
    hass: HomeAssistant, entry: MockConfigEntry, tmp_path: Path
) -> None:
    allowed = tmp_path / "allowed"
    allowed.mkdir()
    hass.config.allowlist_external_dirs = {str(allowed)}
    (tmp_path / "secret.jpg").write_bytes(jpeg(10, 10))
    (allowed / "notes.jpg").write_bytes(b"no picture")
    cases = {
        "path_not_allowed": {"file_path": str(tmp_path / "secret.jpg")},
        "photo_source_missing": {},
        "not_a_picture": {"file_path": str(allowed / "notes.jpg")},
        "photo_not_readable": {"file_path": str(allowed / "missing.jpg")},
    }
    for key, data in cases.items():
        with pytest.raises(ServiceValidationError) as err:
            await hass.services.async_call(
                "rootwise",
                "upload_photo",
                {"entity_id": "sensor.monstera_status", **data},
                blocking=True,
            )
        assert err.value.translation_key == key
