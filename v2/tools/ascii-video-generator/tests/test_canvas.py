import pytest

from ascii_studio.render import canvas, tokens


@pytest.fixture
def look():
    return tokens.load_look("plata")


def test_grid_is_exactly_120x128(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert (grid.cols, grid.rows) == (120, 128)


def test_grid_tiles_canvas_exactly(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert grid.cols * grid.cell_w == grid.width
    assert grid.rows * grid.cell_h == grid.height


def test_non_divisible_canvas_uses_one_cropped_edge_cell(look):
    grid = canvas.make_grid(1081, 1921, look)
    assert grid.cols * grid.cell_w >= grid.width
    assert grid.rows * grid.cell_h >= grid.height
    assert grid.cols * grid.cell_w - grid.width < grid.cell_w
    assert grid.rows * grid.cell_h - grid.height < grid.cell_h


def test_standard_square_canvas_is_supported():
    look = tokens.load_look("manifesto")
    grid = canvas.make_grid(1080, 1080, look)
    assert (grid.cols, grid.rows) == (108, 68)


def test_buffer_shape_applies_supersample(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert grid.buffer_shape() == (1920 * look.supersample, 1080 * look.supersample)


def test_content_zones_do_not_overlap():
    assert canvas.zone_conflicts() == []


def test_zone_order_is_top_to_bottom():
    order = ["title", "stage", "caption", "footer"]
    tops = [canvas.ZONES[name].y0 for name in order]
    assert tops == sorted(tops)


def test_footer_clears_platform_ui():
    """v1 put the signature at y=0.94, inside TikTok's overlay. It must now clear it."""
    footer = canvas.ZONES["footer"]
    for name, mask in canvas.PLATFORM_MASKS.items():
        assert footer.y1 <= mask.y0, f"footer overlaps {name} UI"


def test_zone_px_is_inside_canvas(look):
    grid = canvas.make_grid(1080, 1920, look)
    for zone in canvas.ZONES.values():
        x0, y0, x1, y1 = grid.zone_px(zone)
        assert 0 <= x0 < x1 <= grid.width
        assert 0 <= y0 < y1 <= grid.height


def test_zone_cells_are_within_grid(look):
    grid = canvas.make_grid(1080, 1920, look)
    for zone in canvas.ZONES.values():
        c0, r0, c1, r1 = grid.zone_cells(zone)
        assert 0 <= c0 < c1 <= grid.cols
        assert 0 <= r0 < r1 <= grid.rows


def test_stage_is_the_largest_zone():
    heights = {name: z.y1 - z.y0 for name, z in canvas.ZONES.items()}
    assert max(heights, key=heights.get) == "stage"
