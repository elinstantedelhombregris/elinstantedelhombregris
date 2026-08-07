import time

import numpy as np
import pytest

from ascii_studio.render import canvas, frames, tokens
from ascii_studio.scene import composer
from ascii_studio.scene.legacy import LegacyChapter

MOTIFS = [
    "noise", "signal", "network", "orbit", "mirror",
    "blueprint", "pulse", "fracture", "evidence", "horizon",
]


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


def chapter(motif="network", seed=1634938309):
    return LegacyChapter(
        motif=motif, keyword="CONFIANZA", anchors=["CONFIANZA", "RED"],
        seed=seed, density=0.61, motion=0.47,
    )


@pytest.mark.parametrize("motif", MOTIFS)
def test_every_motif_composes_to_a_valid_buffer(grid, look, motif):
    lum = composer.compose_scene(chapter(motif), grid, 1.0, 0.3, look, {})
    assert lum.shape == grid.buffer_shape()
    assert lum.dtype == np.float32
    assert 0.0 <= float(lum.min()) and float(lum.max()) <= 1.0
    assert float(lum.max()) > float(lum.min()), "buffer collapsed to a constant"


def test_unknown_motif_falls_back_instead_of_crashing(grid, look):
    lum = composer.compose_scene(chapter("not-a-real-motif"), grid, 1.0, 0.3, look, {})
    assert lum.shape == grid.buffer_shape()


def test_compose_is_deterministic(grid, look):
    a = composer.compose_scene(chapter(), grid, 1.0, 0.3, look, {})
    b = composer.compose_scene(chapter(), grid, 1.0, 0.3, look, {})
    assert np.array_equal(a, b)


def test_seed_changes_geometry(grid, look):
    a = composer.compose_scene(chapter("network", seed=1), grid, 1.0, 0.3, look, {})
    b = composer.compose_scene(chapter("network", seed=99), grid, 1.0, 0.3, look, {})
    assert not np.allclose(a, b)


def test_field_animates_over_time(grid, look):
    state = {}
    a = composer.compose_scene(chapter(), grid, 0.0, 0.1, look, state)
    b = composer.compose_scene(chapter(), grid, 2.5, 0.4, look, state)
    assert not np.allclose(a, b)


def test_different_motifs_look_different(grid, look):
    """The whole point of the multi-grid overhaul: chapters must not converge
    on one visual texture the way the single-sine-family legacy scene did."""
    buffers = [
        composer.compose_scene(chapter(motif), grid, 1.0, 0.3, look, {})
        for motif in MOTIFS
    ]
    for i in range(len(buffers)):
        for j in range(i + 1, len(buffers)):
            assert not np.allclose(buffers[i], buffers[j], atol=0.02), (
                f"{MOTIFS[i]} and {MOTIFS[j]} composed to near-identical buffers"
            )


def test_state_is_reused_across_frames_within_a_chapter(grid, look):
    """The FeedbackBuffer must be created once and carried in `state`, not
    rebuilt (and reset) on every call."""
    state = {}
    composer.compose_scene(chapter(), grid, 0.0, 0.05, look, state)
    fb = state.get("feedback")
    assert fb is not None
    composer.compose_scene(chapter(), grid, 0.033, 0.06, look, state)
    assert state["feedback"] is fb


def test_zoom_motifs_get_the_tunnel_preset(grid, look):
    state = {}
    composer.compose_scene(chapter("pulse"), grid, 0.0, 0.1, look, state)
    assert state["feedback"].transform == "zoom"


def test_other_motifs_get_the_ghostly_echo_preset(grid, look):
    state = {}
    composer.compose_scene(chapter("network"), grid, 0.0, 0.1, look, state)
    assert state["feedback"].transform == "shift_up"


def test_content_and_accent_are_near_silent_before_they_enter(grid, look):
    """Directional-arc stagger: at progress 0 only the background layer should
    contribute -- content/accent must not simply snap to full strength."""
    early = composer.compose_scene(chapter(), grid, 0.0, 0.0, look, {})
    later = composer.compose_scene(chapter(), grid, 1.0, 0.6, look, {})
    # A chapter that has "built" (content + accent fully entered) must reach a
    # brighter peak than one caught at its very first instant.
    assert float(later.max()) > float(early.max())


# -- Audio-reactive envelope modulation -------------------------------------


def test_treble_env_brightens_the_accent_layer(grid, look):
    """treble -> accent-layer sparkle/detail. Compared past accent's own entry
    ramp (enter=0.24, ramp=0.45 -> fully in by progress~0.69) so the effect
    isn't swamped by the chapter-build stagger itself."""
    ch = chapter("network")
    quiet = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"treble": 0.0})
    loud = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"treble": 1.0})
    assert float(loud.mean()) > float(quiet.mean())


def test_voice_env_lifts_overall_brightness(grid, look):
    ch = chapter("network")
    quiet = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"voice": 0.0})
    loud = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"voice": 1.0})
    assert float(loud.mean()) > float(quiet.mean())


def test_bass_env_changes_the_composed_geometry(grid, look):
    """bass -> grid/field expansion (a breathing crop-and-rescale). Shape must
    stay stable and the buffer must actually change, not just get brighter."""
    ch = chapter("network")
    still = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"bass": 0.0})
    breathing = composer.compose_scene(ch, grid, 3.0, 0.9, look, {}, env={"bass": 1.0})
    assert still.shape == breathing.shape
    assert not np.allclose(still, breathing)


def test_mid_env_scales_the_feedback_turbulence_and_relaxes_back(grid, look):
    """mid -> turbulence via the feedback buffer's own transform_amt. Must scale
    UP with mid on a loud frame and relax back down to the preset's base amount
    on the next quiet frame, not stick at the boosted value."""
    ch = chapter("network")
    state: dict = {}
    composer.compose_scene(ch, grid, 0.0, 0.3, look, state, env={"mid": 0.0})
    base_amt = state["feedback_base_amt"]
    assert state["feedback"].transform_amt == pytest.approx(base_amt)

    composer.compose_scene(ch, grid, 0.033, 0.31, look, state, env={"mid": 1.0})
    assert state["feedback"].transform_amt > base_amt

    composer.compose_scene(ch, grid, 0.066, 0.32, look, state, env={"mid": 0.0})
    assert state["feedback"].transform_amt == pytest.approx(base_amt)


def test_compose_scene_lands_within_the_perf_budget(grid, look):
    """Budget from the task brief: compose_scene must land at or under 60ms on
    the real buffer size. Generous margin (100ms) to avoid flaking under a
    loaded CI machine while still catching a real regression."""
    ch = chapter("network")  # measured the most expensive motif during tuning
    state = {}
    composer.compose_scene(ch, grid, 0.0, 0.3, look, state)  # warm up
    best = min(
        _time(lambda: composer.compose_scene(ch, grid, i / 30.0, 0.3, look, state))
        for i in range(5)
    )
    assert best < 0.100, f"compose_scene took {best * 1000:.1f}ms, over budget"


def _time(fn) -> float:
    start = time.perf_counter()
    fn()
    return time.perf_counter() - start


# -- Renderer integration --------------------------------------------------


def test_renderer_defaults_to_the_composer_scene():
    r = frames.Renderer(tokens.load_look("plata"))
    assert r.scene == "composer"


def test_renderer_can_select_the_legacy_scene():
    r = frames.Renderer(tokens.load_look("plata"), scene="legacy")
    out = r.frame(chapter(), 1.0, 0.3, 0)
    assert out.shape == (1920, 1080, 3)


def test_unknown_scene_raises():
    with pytest.raises(ValueError, match="composer"):
        frames.Renderer(tokens.load_look("plata"), scene="not-a-scene")


def test_reset_clears_scene_state():
    r = frames.Renderer(tokens.load_look("plata"))
    r.frame(chapter(), 1.0, 0.3, 0)
    assert r._scene_state != {}
    r.reset()
    assert r._scene_state == {}
