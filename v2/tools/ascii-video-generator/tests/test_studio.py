from dataclasses import asdict

import pytest

from ascii_studio.storyboard.build import build_storyboard
from software import app


def test_studio_exposes_v3_direction_controls(tmp_path, monkeypatch):
    monkeypatch.setattr(app.threading.Thread, "start", lambda _self: None)
    source = tmp_path / "source.md"
    source.write_text("# Confianza\n\nLa confianza conecta una comunidad y reduce el miedo.", encoding="utf-8")
    studio = app.Studio(tmp_path / "studio")
    job = studio.create_job({
        "source_path": str(source),
        "mode": "brief",
        "look": "nocturne",
        "duration_mode": "reel",
        "formats": "vertical,square,landscape",
        "cold_open_seconds": "1.4",
        "seed_offset": "3",
    }, "", None)

    command = job.command
    assert command[command.index("--look") + 1] == "nocturne"
    assert command[command.index("--duration-mode") + 1] == "reel"
    assert command[command.index("--formats") + 1] == "vertical,square,landscape"
    assert command[command.index("--cold-open-seconds") + 1] == "1.4"
    assert command[command.index("--seed-offset") + 1] == "3"
    assert command[command.index("--platform-url") + 1] == "www.elinstantedelhombregris.com"
    assert job.platform_url == "www.elinstantedelhombregris.com"
    assert "--persona" not in command


@pytest.mark.parametrize("look", ["tinta-papel", "tinta-papel-ilustrado"])
def test_studio_accepts_tinta_papel_as_a_selectable_look(tmp_path, monkeypatch, look):
    monkeypatch.setattr(app.threading.Thread, "start", lambda _self: None)
    source = tmp_path / "source.md"
    source.write_text("# Papel\n\nLa ciudadanía imprime otra forma de poder.", encoding="utf-8")
    studio = app.Studio(tmp_path / "studio")
    job = studio.create_job({
        "source_path": str(source),
        "mode": "brief",
        "look": look,
    }, "", None)
    assert job.look == look
    assert job.command[job.command.index("--look") + 1] == look


def test_studio_validates_saves_and_approves_reviewed_storyboard(tmp_path, monkeypatch):
    monkeypatch.setattr(app.threading.Thread, "start", lambda _self: None)
    source = tmp_path / "source.md"
    text = "La confianza conecta una comunidad. La transparencia reduce el miedo."
    source.write_text(f"# Confianza\n\n{text}", encoding="utf-8")
    studio = app.Studio(tmp_path / "studio")
    job = studio.create_job({"source_path": str(source), "mode": "brief"}, "", None)
    payload = asdict(build_storyboard("Confianza", "confianza", text, 8))

    reviewed = studio.save_storyboard(job.id, payload, approve=True)

    assert reviewed.storyboard_review_status == "approved"
    assert reviewed.approved_chapters == [chapter["id"] for chapter in payload["chapters"]]
    assert any(asset["relative"].endswith("-reviewed-storyboard.json") for asset in reviewed.assets)
    assert studio.public_job(reviewed)["followup_storyboard"].endswith("-reviewed-storyboard.json")
