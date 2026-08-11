def test_package_imports():
    import ascii_studio
    assert ascii_studio.__name__ == "ascii_studio"


def test_render_subpackage_imports():
    import ascii_studio.render
    assert ascii_studio.render.__name__ == "ascii_studio.render"
