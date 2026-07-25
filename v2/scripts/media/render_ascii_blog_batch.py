#!/usr/bin/env python3
"""Batch render full-script ASCII blog videos with validation reports."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from render_ascii_blog_mobile_full import EDGE_EXPRESSIVE_VOICE, EDGE_PITCH, EDGE_RATE, V2_ROOT, frontmatter_text, parse_post


BLOG_DIR = V2_ROOT / "content/blog"
PUBLIC_MEDIA_DIR = V2_ROOT / "apps/web/public/media/ascii-videos"
REPO_ROOT = V2_ROOT.parent
RENDERER = V2_ROOT / "scripts/media/render_ascii_blog_mobile_full.py"
REGISTRY_GENERATOR = V2_ROOT / "scripts/media/generate_ascii_video_registry.py"


def run(command: list[str], env: dict[str, str] | None = None) -> None:
    subprocess.run(command, check=True, env=env)


def capture(command: list[str]) -> str:
    return subprocess.check_output(command, text=True).strip()


def edge_env() -> dict[str, str]:
    env = os.environ.copy()
    edge_target = Path("/tmp/codex-edge-tts")
    if edge_target.exists():
        existing = env.get("PYTHONPATH", "")
        env["PYTHONPATH"] = str(edge_target) if not existing else f"{edge_target}{os.pathsep}{existing}"
    return env


def resolve_posts(paths: list[Path], limit: int | None) -> list[Path]:
    if paths:
        posts = [path.resolve() for path in paths]
    else:
        posts = sorted(BLOG_DIR.glob("*.mdx"), key=lambda path: path.name)
    if limit is not None:
        posts = posts[:limit]
    return posts


def jobs_from_manifests(manifests: list[Path], limit: int | None) -> list[tuple[Path, str, Path]]:
    jobs: list[tuple[Path, str, Path]] = []
    for manifest_path in manifests:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        source = manifest.get("source")
        slug = str(manifest.get("slug", "")).removesuffix("-mobile-full")
        if not source or not slug:
            continue
        jobs.append(((V2_ROOT / source).resolve(), slug, manifest_path.resolve().parent))
    if limit is not None:
        jobs = jobs[:limit]
    return jobs


def post_slug(path: Path) -> str:
    frontmatter, _body = parse_post(path)
    return frontmatter_text(frontmatter, "slug", path.stem)


def display_path(path: Path) -> str:
    path = path.resolve()
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def output_paths(asset_slug: str, out_dir: Path | None = None) -> tuple[Path, Path, Path, Path]:
    out_dir = out_dir or PUBLIC_MEDIA_DIR / asset_slug
    slug = f"{asset_slug}-mobile-full"
    return out_dir, out_dir / f"{slug}.mp4", out_dir / f"{slug}.srt", out_dir / f"{slug}-manifest.json"


def seconds(value: str) -> float:
    hh, mm, rest = value.split(":")
    ss, ms = rest.split(",")
    return int(hh) * 3600 + int(mm) * 60 + int(ss) + int(ms) / 1000


def check_srt(path: Path) -> dict[str, object]:
    if not path.exists():
        return {"exists": False, "captionCount": 0, "overlaps": ["missing"]}
    text = path.read_text(encoding="utf-8")
    overlaps: list[int] = []
    prev = -1.0
    count = 0
    for index, (start_raw, end_raw) in enumerate(
        re.findall(r"(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)", text),
        start=1,
    ):
        count = index
        start = seconds(start_raw)
        end = seconds(end_raw)
        if start < prev or end < start:
            overlaps.append(index)
        prev = end
    return {"exists": True, "captionCount": count, "overlaps": overlaps}


def ffprobe(path: Path) -> dict[str, object]:
    raw = capture(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration,size:stream=index,codec_type,codec_name,width,height,avg_frame_rate,duration",
            "-of",
            "json",
            str(path),
        ]
    )
    return json.loads(raw)


def volume(path: Path) -> dict[str, str]:
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
    )
    result: dict[str, str] = {}
    for key in ["mean_volume", "max_volume"]:
        match = re.search(rf"{key}:\s*(-?\d+(?:\.\d+)?) dB", proc.stdout)
        if match:
            result[key] = f"{match.group(1)} dB"
    return result


def validate_video(video_path: Path, srt_path: Path) -> dict[str, object]:
    if not video_path.exists():
        return {"ok": False, "error": "missing video"}
    srt = check_srt(srt_path)
    info = ffprobe(video_path)
    loudness = volume(video_path)
    return {
        "ok": not srt["overlaps"],
        "ffprobe": info,
        "audio": loudness,
        "srt": srt,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--posts", type=Path, nargs="*", help="Specific MDX posts to render. Defaults to blog posts.")
    parser.add_argument("--manifests", type=Path, nargs="*", help="Re-render existing mobile-full manifests, preserving their asset slugs and output folders.")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--out-root", type=Path, default=PUBLIC_MEDIA_DIR, help="Root output directory. Defaults to the website public media directory.")
    parser.add_argument("--tts-provider", choices=["edge", "say"], default="edge")
    parser.add_argument("--edge-voice", default=EDGE_EXPRESSIVE_VOICE)
    parser.add_argument("--edge-rate", default=EDGE_RATE)
    parser.add_argument("--edge-pitch", default=EDGE_PITCH)
    parser.add_argument("--with-seal", action="store_true")
    parser.add_argument("--skip-existing", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--crf", type=int, default=27)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--generate-registry", action="store_true")
    args = parser.parse_args()
    output_root = args.out_root.resolve()

    if args.manifests:
        jobs = jobs_from_manifests([path.resolve() for path in args.manifests], args.limit)
    else:
        jobs = [(post, post_slug(post), output_root / post_slug(post)) for post in resolve_posts(args.posts or [], args.limit)]
    report: dict[str, object] = {
        "createdAt": datetime.now().isoformat(timespec="seconds"),
        "renderer": str(RENDERER.relative_to(V2_ROOT)),
        "outputRoot": display_path(output_root),
        "count": len(jobs),
        "withSeal": args.with_seal,
        "crf": args.crf,
        "voice": args.edge_voice if args.tts_provider == "edge" else args.tts_provider,
        "voiceRate": args.edge_rate if args.tts_provider == "edge" else None,
        "voicePitch": args.edge_pitch if args.tts_provider == "edge" else None,
        "items": [],
    }
    items: list[dict[str, object]] = []
    report["items"] = items

    for post, asset_slug, job_out_dir in jobs:
        out_dir, video_path, srt_path, manifest_path = output_paths(asset_slug, job_out_dir)
        item: dict[str, object] = {
            "post": str(post.relative_to(V2_ROOT)),
            "assetSlug": asset_slug,
            "video": display_path(video_path),
            "manifest": display_path(manifest_path),
        }
        items.append(item)

        if args.skip_existing and video_path.exists() and manifest_path.exists() and not args.force:
            item["status"] = "skipped-existing"
            item["validation"] = validate_video(video_path, srt_path)
            continue

        out_dir.mkdir(parents=True, exist_ok=True)
        command = [
            sys.executable,
            str(RENDERER),
            "--post",
            str(post),
            "--asset-slug",
            asset_slug,
            "--out",
            str(out_dir),
            "--tts-provider",
            args.tts_provider,
            "--crf",
            str(args.crf),
        ]
        if args.tts_provider == "edge":
            command.extend(["--edge-voice", args.edge_voice, f"--edge-rate={args.edge_rate}", f"--edge-pitch={args.edge_pitch}"])
        if args.with_seal:
            command.append("--with-seal")
        try:
            run(command, env=edge_env())
            item["status"] = "rendered"
            item["validation"] = validate_video(video_path, srt_path)
        except subprocess.CalledProcessError as exc:
            item["status"] = "failed"
            item["error"] = str(exc)

    if args.generate_registry and REGISTRY_GENERATOR.exists():
        run([sys.executable, str(REGISTRY_GENERATOR)])
        report["registryGenerated"] = True

    report_path = args.report or output_root / f"batch-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(report_path), **report}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
