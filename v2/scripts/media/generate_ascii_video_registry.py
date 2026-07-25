#!/usr/bin/env python3
"""Generate the web ASCII video registry from media manifests."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from render_ascii_blog_mobile_full import V2_ROOT, frontmatter_text, parse_post


PUBLIC_ROOT = V2_ROOT / "apps/web/public"
MEDIA_ROOT = PUBLIC_ROOT / "media/ascii-videos"
OUTPUT = V2_ROOT / "apps/web/src/components/asciiVideoRegistry.generated.ts"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def public_url(path_or_value: str | Path | None) -> str | None:
    if not path_or_value:
        return None
    path = Path(path_or_value)
    if path.is_absolute():
        try:
            return "/" + str(path.relative_to(PUBLIC_ROOT))
        except ValueError:
            return str(path)
    return "/" + str(path).lstrip("/")


def source_slug(source: str | None) -> str | None:
    if not source:
        return None
    path = V2_ROOT / source
    if not path.exists():
        return None
    frontmatter, _body = parse_post(path)
    return frontmatter_text(frontmatter, "slug", path.stem)


def duration_label(seconds: float | int | None) -> str:
    if not seconds:
        return "?:??"
    seconds = int(round(float(seconds)))
    return f"{seconds // 60}:{seconds % 60:02d}"


def aspect_from_size(size: list[int] | tuple[int, int] | None) -> str:
    if not size or len(size) != 2:
        return "vertical"
    return "vertical" if int(size[1]) >= int(size[0]) else "wide"


def compact(value: dict[str, Any]) -> dict[str, Any]:
    return {key: item for key, item in value.items() if item is not None}


def variant_id(manifest: dict[str, Any], used: set[str]) -> str:
    aspect = aspect_from_size(manifest.get("size"))
    base = "mobile-full" if aspect == "vertical" else "short-wide"
    if base not in used:
        used.add(base)
        return base
    fallback = str(manifest.get("slug") or base)
    if fallback not in used:
        used.add(fallback)
        return fallback
    index = 2
    while f"{base}-{index}" in used:
        index += 1
    used.add(f"{base}-{index}")
    return f"{base}-{index}"


def main_variant(manifest: dict[str, Any], used: set[str]) -> dict[str, Any] | None:
    video = public_url(manifest.get("video"))
    poster = public_url(manifest.get("poster"))
    subtitles = public_url(manifest.get("vtt") or manifest.get("subtitles"))
    audio = public_url(manifest.get("mix") or manifest.get("soundtrack") or manifest.get("music"))
    if not video or not poster or not subtitles or not audio:
        return None

    aspect = aspect_from_size(manifest.get("size"))
    sealed = bool((manifest.get("seal") or {}).get("enabled"))
    if aspect == "vertical":
        label = "Mobile con sello" if sealed else "Mobile full"
        note = "sello cruz orlada" if sealed else "guion completo"
    else:
        label = "Short 16:9"
        note = "resumen"
    return compact({
        "id": variant_id(manifest, used),
        "label": label,
        "eyebrow": f"{'9:16' if aspect == 'vertical' else '16:9'} · {duration_label(manifest.get('durationSeconds'))} · {note}",
        "title": manifest.get("title") or "Video ASCII",
        "videoSrc": video,
        "posterSrc": poster,
        "subtitlesSrc": subtitles,
        "subtitlesDownloadSrc": public_url(manifest.get("srt")),
        "soundtrackSrc": audio,
        "scriptSrc": public_url(manifest.get("scriptMarkdown")),
        "aspect": aspect,
    })


def overlay_variant(manifest: dict[str, Any], base_variant: dict[str, Any]) -> dict[str, Any] | None:
    output = public_url(manifest.get("output"))
    if not output:
        return None
    output_path = Path(manifest["output"])
    poster_path = output_path.with_name(output_path.stem + "-poster.jpg")
    poster = public_url(poster_path) if poster_path.exists() else base_variant["posterSrc"]
    duration = manifest.get("durationSeconds")
    return {
        **base_variant,
        "id": "seal-test",
        "label": "Sello ASCII",
        "eyebrow": f"9:16 · {duration_label(duration)} · prueba cruz orlada",
        "videoSrc": output,
        "posterSrc": poster,
    }


def main() -> None:
    configs: dict[str, dict[str, Any]] = {}
    used_ids: dict[str, set[str]] = {}
    video_to_base: dict[str, tuple[str, dict[str, Any]]] = {}
    overlay_manifests: list[dict[str, Any]] = []

    manifest_paths = sorted(MEDIA_ROOT.glob("**/*-manifest.json")) + sorted(MEDIA_ROOT.glob("**/manifest.json"))
    for path in manifest_paths:
        manifest = read_json(path)
        if "output" in manifest and "input" in manifest:
            overlay_manifests.append(manifest)
            continue
        post_slug = source_slug(manifest.get("source"))
        if not post_slug:
            continue
        config = configs.setdefault(post_slug, {"title": manifest.get("title") or "Video ASCII", "variants": []})
        used = used_ids.setdefault(post_slug, set())
        variant = main_variant(manifest, used)
        if not variant:
            continue
        config["variants"].append(variant)
        video_url = variant["videoSrc"]
        video_path = PUBLIC_ROOT / video_url.lstrip("/")
        video_to_base[str(video_path.resolve())] = (post_slug, variant)

    for manifest in overlay_manifests:
        input_path = Path(manifest["input"]).resolve()
        base = video_to_base.get(str(input_path))
        if not base:
            continue
        post_slug, base_variant = base
        config = configs[post_slug]
        if any(variant["id"] == "seal-test" for variant in config["variants"]):
            continue
        variant = overlay_variant(manifest, base_variant)
        if variant:
            config["variants"].append(variant)

    for config in configs.values():
        config["variants"].sort(key=lambda variant: {"mobile-full": 0, "seal-test": 1, "short-wide": 2}.get(variant["id"], 3))

    OUTPUT.write_text(
        "/* This file is generated by v2/scripts/media/generate_ascii_video_registry.py. */\n"
        "export interface AsciiVideoVariant {\n"
        "  id: string;\n"
        "  label: string;\n"
        "  eyebrow: string;\n"
        "  title: string;\n"
        "  videoSrc: string;\n"
        "  posterSrc: string;\n"
        "  subtitlesSrc: string;\n"
        "  subtitlesDownloadSrc?: string;\n"
        "  soundtrackSrc: string;\n"
        "  scriptSrc?: string;\n"
        "  aspect: 'vertical' | 'wide';\n"
        "}\n\n"
        "export interface AsciiVideoConfig {\n"
        "  title: string;\n"
        "  variants: AsciiVideoVariant[];\n"
        "}\n\n"
        f"export const ASCII_VIDEOS: Record<string, AsciiVideoConfig> = {json.dumps(configs, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    print(json.dumps({"output": str(OUTPUT), "posts": len(configs)}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
