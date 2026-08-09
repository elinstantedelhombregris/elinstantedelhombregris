"""v2 command line. `stills` and `bench` are diagnostics; `render` is the full pipeline."""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import asdict, replace
from pathlib import Path

import cv2
import numpy as np

from . import stills, video
from .audio import score as score_module
from .audio.design import build_music, build_sfx, mix_audio
from .editorial.script import performance_script
from .editorial.adapt import adapt_for_reel
from .render import cover as cover_module
from .render import frames, seal, tokens, typography
from .render.frames import Renderer
from .render.tokens import load_look
from .scene.legacy import LegacyChapter
from .source import read_source
from .speech.captions import (
    build_precise_captions, caption_text, validate_caption_sync, write_word_timings,
)
from .speech.subtitles import write_subtitles
from .speech.tts import (
    DEFAULT_EDGE_PITCH, DEFAULT_EDGE_RATE, DEFAULT_EDGE_VOICE, DEFAULT_SAY_RATE,
    DEFAULT_SAY_VOICE, VOICE_PERFORMANCE_CHOICES, synthesize_voice,
)
from .speech.pronunciation import apply_pronunciations, restore_timing_text, validate_pronunciations
from .storyboard.build import build_storyboard, scene_ranges, write_art_direction
from .storyboard.director import upgrade_storyboard_v4
from .storyboard.illustrated import (
    ILLUSTRATED_LOOK, analyze_storyboard_plates, bind_illustrated_timeline,
    illustrated_protocol_summary, illustration_briefs, validate_illustrated_protocol,
)
from .storyboard.schema import load_storyboard, write_json
from .text import slugify
from .util import run
from .production import package as packaging
from .production.verify import verify_package, write_report

# Kept only so --persona still parses in command lines recorded before the persona
# figure was removed; the flag no longer does anything (see run_render()).
PERSONA_CHOICES = ("none", "hombre-gris")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="ascii-studio")
    sub = parser.add_subparsers(dest="command", required=True)

    still = sub.add_parser("stills", help="Render one still per storyboard chapter")
    still.add_argument("--storyboard", required=True, type=Path)
    still.add_argument("--out", required=True, type=Path)
    still.add_argument("--look", default="plata")
    still.add_argument("--contact-sheet", action="store_true")

    bench = sub.add_parser("bench", help="Measure single-threaded frame throughput")
    bench.add_argument("--frames", type=int, default=24)
    bench.add_argument("--look", default="plata")
    bench.add_argument("--world", default="none",
                       help="Benchmark a v4 cinematic world, e.g. civic-plaza")

    render = sub.add_parser("render", help="Render a full source-to-video pipeline")
    render.add_argument("--input", required=True, help="Source .txt, .md, or .mdx file")
    render.add_argument("--out", required=True, help="Output directory")
    render.add_argument("--title", help="Override inferred title")
    render.add_argument("--slug", help="Override output slug")
    render.add_argument("--storyboard", help="Use an edited storyboard JSON instead of the automatic draft")
    render.add_argument("--plate-dir", type=Path,
                        help="Optional approved PNG/JPG plates named after chapter ids")
    render.add_argument("--brief-only", action="store_true", help="Write brief and storyboard without rendering")
    render.add_argument(
        "--chapters", type=int, default=8,
        help="Maximum automatic chapter count for ASCII looks; ignored by the narrative-first illustrated protocol",
    )
    render.add_argument("--seed-offset", type=int, default=0,
                        help="Deterministically reroll the visual direction without changing the script")
    render.add_argument("--duration-mode", choices=("auto", "reel", "long"), default="auto",
                        help="Adapt long source text for a social reel, or preserve the full script")
    render.add_argument("--reel-min-words", type=int, default=170)
    render.add_argument("--reel-max-words", type=int, default=240)
    render.add_argument("--pronunciations", type=Path, help="JSON object mapping visible tokens to one-token spoken aliases")
    render.add_argument("--tts", choices=("edge", "say", "none"), default="say")
    render.add_argument("--voice", default=DEFAULT_EDGE_VOICE, help="Edge TTS voice")
    render.add_argument("--edge-rate", default=DEFAULT_EDGE_RATE)
    render.add_argument("--edge-pitch", default=DEFAULT_EDGE_PITCH)
    render.add_argument("--say-voice", default=DEFAULT_SAY_VOICE, help="macOS say voice")
    render.add_argument("--say-rate", type=int, default=DEFAULT_SAY_RATE)
    render.add_argument("--voice-performance", choices=VOICE_PERFORMANCE_CHOICES, default="editorial", help="Cadence shaping for narration without changing spoken words")
    render.add_argument("--logo", help="Optional logo image for the final ASCII seal")
    render.add_argument(
        "--platform-url", default="www.elinstantedelhombregris.com",
        help="Permanent brand signature displayed in the safe footer zone",
    )
    render.add_argument("--persona", choices=PERSONA_CHOICES, default="none", help="Removed: the persona figure no longer renders; kept as a no-op for old command lines")
    render.add_argument("--intro-seal-seconds", type=float, default=1.6, help="Seconds for the large ASCII logo reveal")
    render.add_argument("--cold-open-seconds", type=float, default=1.25, help="Hook-first typographic cold open duration")
    render.add_argument("--look", default=None, help="Rendering look/palette; defaults to the storyboard look")
    render.add_argument("--formats", default="vertical", help="Comma-separated vertical,square,landscape renders")
    render.add_argument("--hook-seconds", type=float, default=45.0)
    render.add_argument("--no-hook-cut", action="store_true")
    render.add_argument("--no-seamless-loop", action="store_true")
    render.add_argument(
        "--scene", choices=("legacy", "composer"), default="composer",
        help="Scene source: 'composer' (multi-grid layered fields, default) or 'legacy' (v1's single sine family)",
    )
    render.add_argument("--width", type=int, default=1080)
    render.add_argument("--height", type=int, default=1920)
    render.add_argument("--fps", type=int, default=30)
    render.add_argument("--crf", type=int, default=18)
    render.add_argument("--workers", type=int, default=None, help="Worker processes for the chapter-aligned render pool")
    render.add_argument("--render-seconds", type=float, help="Trim render length; useful for smoke tests")
    render.add_argument("--skip-upload", action="store_true", help="Skip the social upload derivative")
    render.add_argument("--keep-video-only", action="store_true", help="Keep the large silent intermediate after muxing")
    render.add_argument(
        "--reuse-master", action="store_true",
        help="Resume derivatives from an existing compatible vertical master",
    )

    return parser


def _cover_frame(ctx: video.RenderContext, t: float) -> np.ndarray:
    """A single clean (caption-free) frame from the new engine, for the JPEG cover."""
    renderer = Renderer(load_look(ctx.look_name), ctx.width, ctx.height, scene=ctx.scene)
    chapters = ctx.storyboard.chapters
    index, chapter, progress = video.chapter_at(t, chapters, ctx.ranges)
    legacy = video._as_legacy(chapter, video.reveal_points_for(chapter, ctx.captions, ctx.ranges))
    extra = None
    if ctx.intro_seal_seconds > 0 and t < ctx.intro_seal_seconds:
        extra = seal.seal_luminance(ctx.logo_mask, renderer.grid, t, ctx.intro_seal_seconds)
    env = video._env_at(ctx, int(round(t * ctx.fps)))
    frame = renderer.frame(legacy, t, progress, 0, extra=extra, env=env)
    return typography.overlay(
        frame, renderer.grid, renderer.look,
        caption=None, t=t,
        title=ctx.storyboard.title, chapter_label=chapter.label,
        chapter_index=index, chapter_count=len(chapters), progress=progress,
        keyword=chapter.keyword, url=ctx.url, scene_chapter=legacy,
        hook=ctx.storyboard.hook, cold_open_seconds=ctx.cold_open_seconds,
    )


def _compatible_delivery(path: Path, width: int, height: int, duration: float) -> bool:
    if not path.exists() or path.stat().st_size == 0:
        return False
    try:
        media = packaging.probe(path)
        video_stream = next(value for value in media["streams"] if value["codec_type"] == "video")
        audio_stream = next(value for value in media["streams"] if value["codec_type"] == "audio")
        existing_duration = float(media.get("format", {}).get("duration", 0.0) or 0.0)
        return (
            int(video_stream.get("width", 0)) == width
            and int(video_stream.get("height", 0)) == height
            and video_stream.get("codec_name") == "h264"
            and video_stream.get("pix_fmt") == "yuv420p"
            and audio_stream.get("codec_name") == "aac"
            and int(audio_stream.get("channels", 0)) == 2
            and abs(existing_duration - duration) <= 1.0
        )
    except (OSError, KeyError, StopIteration, ValueError):
        return False


def write_preview(path: Path, video_name: str, title: str) -> None:
    path.write_text(
        f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>html,body{{height:100%;margin:0;background:#070a0b}}body{{display:grid;place-items:center}}video{{height:96vh;max-width:96vw}}</style>
</head><body><video controls autoplay loop playsinline src="../{video_name}"></video></body></html>
""",
        encoding="utf-8",
    )


def run_render(args: argparse.Namespace) -> dict[str, str]:
    input_path = Path(args.input).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    title, source_text = read_source(input_path, args.title)
    slug = args.slug or slugify(title)
    adapt = args.duration_mode == "reel" or (
        args.duration_mode == "auto" and not args.storyboard and len(source_text.split()) > args.reel_max_words
    )
    text = adapt_for_reel(source_text, title, args.reel_min_words, args.reel_max_words) if adapt else source_text
    if args.storyboard:
        storyboard = load_storyboard(Path(args.storyboard).expanduser().resolve())
        look_name = args.look or storyboard.look or "plata"
    else:
        look_name = args.look or "plata"
        storyboard = build_storyboard(
            title, slug, text, args.chapters, illustrated=look_name == ILLUSTRATED_LOOK,
        )
    if look_name != ILLUSTRATED_LOOK:
        storyboard = upgrade_storyboard_v4(storyboard)
    if args.plate_dir:
        plate_dir = args.plate_dir.expanduser().resolve()
        if not plate_dir.is_dir():
            raise ValueError(f"Plate directory not found: {plate_dir}")
        for chapter in storyboard.chapters:
            candidate = next(
                (plate_dir / f"{chapter.id}{suffix}" for suffix in (".png", ".jpg", ".jpeg", ".webp")
                 if (plate_dir / f"{chapter.id}{suffix}").exists()),
                None,
            )
            if candidate:
                chapter.plate = str(candidate)
    if args.seed_offset:
        for chapter in storyboard.chapters:
            chapter.seed = (chapter.seed + args.seed_offset * 104729) % (2 ** 32)
    storyboard.slug = slug
    storyboard.title = args.title or storyboard.title
    storyboard.look = look_name
    if look_name == ILLUSTRATED_LOOK:
        analyze_storyboard_plates(storyboard)
    external_pronunciations = {}
    if args.pronunciations:
        external_pronunciations = json.loads(Path(args.pronunciations).expanduser().read_text(encoding="utf-8"))
        if not isinstance(external_pronunciations, dict):
            raise ValueError("--pronunciations must contain a JSON object")
    pronunciations = validate_pronunciations({**storyboard.pronunciations, **external_pronunciations})
    storyboard.pronunciations = pronunciations
    storyboard_path = out_dir / f"{slug}-storyboard.json"
    brief_path = out_dir / f"{slug}-brief.json"
    art_direction_path = out_dir / f"{slug}-art-direction.md"
    write_json(storyboard_path, asdict(storyboard))
    write_art_direction(art_direction_path, storyboard)
    illustrated_summary = (
        illustrated_protocol_summary(storyboard) if look_name == ILLUSTRATED_LOOK else None
    )
    illustrated_protocol_path = out_dir / f"{slug}-illustrated-protocol.json"
    illustration_briefs_path = out_dir / f"{slug}-illustration-briefs.json"
    if illustrated_summary is not None:
        write_json(illustrated_protocol_path, illustrated_summary)
        write_json(illustration_briefs_path, illustration_briefs(storyboard))
    write_json(brief_path, {
        "title": storyboard.title,
        "slug": storyboard.slug,
        "thesis": storyboard.thesis,
        "keywords": storyboard.keywords,
        "chapter_count": len(storyboard.chapters),
        "motifs": [chapter.motif for chapter in storyboard.chapters],
        "archetypes": [chapter.archetype for chapter in storyboard.chapters],
        "worlds": [chapter.world for chapter in storyboard.chapters],
        "hook": storyboard.hook,
        "cover_hook": storyboard.cover_hook,
        "format": storyboard.format,
        "source_word_count": len(source_text.split()),
        "narration_word_count": len(text.split()),
        "illustrated_protocol": illustrated_summary,
        "art_direction": [
            {
                "chapter": chapter.id,
                "metaphor": chapter.metaphor,
                "anchors": chapter.anchors,
                "composition": chapter.composition,
                "density": chapter.density,
                "motion": chapter.motion,
                "rhetoric": chapter.rhetoric,
                "archetype": chapter.archetype,
                "relations": [asdict(value) for value in chapter.relations],
                "shots": [asdict(value) for value in chapter.shots],
                "world": chapter.world,
                "hero_subject": chapter.hero_subject,
                "depth_layers": chapter.depth_layers,
                "lighting": chapter.lighting,
                "metamorphosis": chapter.metamorphosis,
                "plate": chapter.plate,
                "illustration": asdict(chapter.illustration) if chapter.illustration else None,
            }
            for chapter in storyboard.chapters
        ],
        "input": str(input_path),
    })
    script = " ".join(caption_text(text) for chapter in storyboard.chapters for text in chapter.texts)
    voice_script = performance_script(script, args.voice_performance)
    script_path = out_dir / f"{slug}-script.txt"
    voice_script_path = out_dir / f"{slug}-voice-performance-script.txt"
    adaptation_path = out_dir / f"{slug}-social-adaptation.txt"
    adaptation_path.write_text(text + "\n", encoding="utf-8")
    voice_script = apply_pronunciations(voice_script, pronunciations)
    script_path.write_text(script + "\n", encoding="utf-8")
    voice_script_path.write_text(voice_script + "\n", encoding="utf-8")
    assets = {
        "brief": str(brief_path),
        "storyboard": str(storyboard_path),
        "art_direction": str(art_direction_path),
        "script": str(script_path),
        "voice_performance_script": str(voice_script_path),
        "social_adaptation": str(adaptation_path),
    }
    if illustrated_summary is not None:
        assets["illustrated_protocol"] = str(illustrated_protocol_path)
        assets["illustration_briefs"] = str(illustration_briefs_path)
    has_all_illustrated_plates = look_name != ILLUSTRATED_LOOK or all(
        chapter.plate and Path(chapter.plate).exists() for chapter in storyboard.chapters
    )
    if has_all_illustrated_plates:
        shot_dir = out_dir / "storyboard-stills"
        shot_stills = stills.render_shot_stills(storyboard_path, shot_dir, look_name)
        storyboard_sheet = stills.contact_sheet(
            shot_stills, out_dir / f"{slug}-storyboard-contact-sheet.png", columns=3, look_name=look_name,
        )
        assets["storyboard_contact_sheet"] = str(storyboard_sheet)
        hero_dir = out_dir / "hero-plates"
        hero_stills = stills.render_hero_stills(storyboard_path, hero_dir, look_name)
        hero_sheet = stills.contact_sheet(
            hero_stills, out_dir / f"{slug}-hero-plate-contact-sheet.png",
            columns=min(5, max(1, len(hero_stills))), look_name=look_name,
        )
        assets["hero_plate_contact_sheet"] = str(hero_sheet)
    if args.brief_only:
        return assets
    if look_name == ILLUSTRATED_LOOK:
        readiness = validate_illustrated_protocol(storyboard, require_render_ready=True)
        if readiness:
            sample = "\n".join(f"- {value}" for value in readiness[:24])
            raise RuntimeError(
                "Illustrated protocol is not approved; refusing to synthesize or render:\n" + sample
            )
    voice_path, timings, duration = synthesize_voice(
        voice_script, out_dir, slug, args.tts, args.voice, args.edge_rate, args.edge_pitch,
        args.say_voice, args.say_rate, args.render_seconds,
    )
    timings = restore_timing_text(timings, pronunciations)
    if args.render_seconds:
        duration = min(duration, args.render_seconds)
    captions = build_precise_captions(storyboard.chapters, timings)
    validate_caption_sync(captions, timings)
    if look_name == ILLUSTRATED_LOOK:
        illustrated_timeline = bind_illustrated_timeline(storyboard, captions)
        illustrated_timeline_path = out_dir / f"{slug}-illustrated-timeline.json"
        write_json(illustrated_timeline_path, illustrated_timeline)
        assets["illustrated_timeline"] = str(illustrated_timeline_path)
        if not illustrated_timeline["passed"]:
            raise RuntimeError(
                "Illustrated word-bound timeline failed: "
                + "; ".join(illustrated_timeline["errors"][:12])
            )
    srt_path, vtt_path = out_dir / f"{slug}.srt", out_dir / f"{slug}.vtt"
    word_timings_path = out_dir / f"{slug}-word-timings.json"
    write_subtitles(captions, srt_path, vtt_path)
    write_word_timings(word_timings_path, timings, captions)
    ranges = scene_ranges(captions, storyboard.chapters, duration)
    music = build_music(duration, storyboard.chapters, ranges)
    cue_times = []
    for chapter in storyboard.chapters:
        start, end = ranges[chapter.id]
        points = video.reveal_points_for(chapter, captions, ranges)
        for relation in chapter.relations:
            point = points.get(relation.target, points.get(relation.source, 0.5))
            cue_times.append((start + (end - start) * point, relation.kind))
    sfx = build_sfx(
        duration, storyboard.chapters, ranges, cue_times=cue_times,
        sound_style="paper" if load_look(look_name).is_paper else "cinematic",
    )
    music_path, sfx_path, mix_path = mix_audio(voice_path, music, sfx, out_dir, slug)

    # The score already knows every note onset, chapter root and section boundary
    # -- export that as per-frame visual drive signals instead of re-discovering
    # beats by analysing the finished mix (see audio/score.py's module docstring).
    envelopes = score_module.score_envelopes(storyboard.chapters, ranges, duration, args.fps)
    envelopes["voice"] = score_module.voice_envelope(voice_path, len(envelopes["bass"]), args.fps)

    ctx = video.RenderContext(
        storyboard=storyboard, captions=captions, ranges=ranges,
        logo_mask=seal.load_logo_mask(Path(args.logo) if args.logo else None),
        url=args.platform_url, intro_seal_seconds=args.intro_seal_seconds,
        cold_open_seconds=args.cold_open_seconds,
        look_name=look_name, width=args.width, height=args.height,
        fps=args.fps, crf=args.crf, scene=args.scene, envelopes=envelopes,
    )
    video_only = out_dir / f"{slug}-video-only.mp4"
    master = out_dir / f"{slug}-master.mp4"
    if args.reuse_master:
        if not _compatible_delivery(master, args.width, args.height, duration):
            raise RuntimeError("Existing master is incompatible with this canvas or narration duration")
    else:
        video.render_video(ctx, duration, video_only, workers=args.workers)
        run(["ffmpeg", "-y", "-i", video_only, "-i", mix_path, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", master], quiet=True)
        if not args.keep_video_only:
            video_only.unlink(missing_ok=True)

    cover = out_dir / f"{slug}-cover.jpg"
    cover_frame = _cover_frame(ctx, duration * 0.82)
    cover_module.designed_cover(
        cover_frame, storyboard.title, storyboard.cover_hook, load_look(look_name), cover,
        url=args.platform_url,
    )
    video_sheet = packaging.contact_sheet(master, out_dir / f"{slug}-contact-sheet.png")
    hook_path = None
    if not args.no_hook_cut:
        hook_path = packaging.hook_cut(master, out_dir / f"{slug}-hook-cut.mp4", args.hook_seconds)
    loop_path = None
    if not args.no_seamless_loop:
        loop_path = packaging.seamless_loop(master, out_dir / f"{slug}-seamless-loop.mp4")

    requested_formats = {value.strip() for value in args.formats.split(",") if value.strip()}
    unknown_formats = requested_formats - {"vertical", "square", "landscape"}
    if unknown_formats:
        raise ValueError(f"Unknown formats: {', '.join(sorted(unknown_formats))}")
    requested_formats.add("vertical")
    format_assets = {}
    for format_name, (format_width, format_height) in {
        "square": (1080, 1080), "landscape": (1440, 810),
    }.items():
        if format_name not in requested_formats:
            continue
        format_ctx = replace(ctx, width=format_width, height=format_height)
        format_video_only = out_dir / f"{slug}-{format_name}-video-only.mp4"
        format_master = out_dir / f"{slug}-{format_name}.mp4"
        if not (args.reuse_master and _compatible_delivery(
            format_master, format_width, format_height, duration,
        )):
            video.render_video(format_ctx, duration, format_video_only, workers=args.workers)
            run(["ffmpeg", "-y", "-i", format_video_only, "-i", mix_path, "-c:v", "copy",
                 "-c:a", "aac", "-b:a", "192k", "-shortest", format_master], quiet=True)
            format_video_only.unlink(missing_ok=True)
        format_assets[format_name] = str(format_master)
    preview_dir = out_dir / "preview"
    preview_dir.mkdir(exist_ok=True)
    write_preview(preview_dir / "index.html", master.name, storyboard.title)
    assets.update({
        "voice": str(voice_path),
        "music_stem": str(music_path),
        "sound_design_stem": str(sfx_path),
        "mix": str(mix_path),
        "captions_srt": str(srt_path),
        "captions_vtt": str(vtt_path),
        "word_timings": str(word_timings_path),
        "cover": str(cover),
        "contact_sheet": str(video_sheet),
        "master": str(master),
        "preview": str(preview_dir / "index.html"),
    })
    if hook_path:
        assets["hook_cut"] = str(hook_path)
    if loop_path:
        assets["seamless_loop"] = str(loop_path)
    assets.update(format_assets)
    if not args.skip_upload:
        upload = out_dir / f"{slug}-instagram-upload.mp4"
        if not (args.reuse_master and _compatible_delivery(
            upload, args.width, args.height, duration,
        )):
            run([
                "ffmpeg", "-y", "-i", master, "-c:v", "libx264", "-preset", "slow", "-b:v", "6500k",
                "-maxrate", "7200k", "-bufsize", "13000k", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-c:a", "aac", "-b:a", "160k", upload,
            ], quiet=True)
        assets["instagram_upload"] = str(upload)
    verification = verify_package(
        master, cover, storyboard, captions, timings, args.width, args.height,
        required_assets=assets, platform_url=args.platform_url,
    )
    report_path = write_report(out_dir / f"{slug}-verification.json", verification)
    assets["verification"] = str(report_path)
    if not verification["passed"]:
        failed = [name for name, passed in verification["checks"].items() if not passed]
        raise RuntimeError(f"Production verification failed: {', '.join(failed)}")
    manifest = out_dir / f"{slug}-manifest.json"
    write_json(manifest, {
        "software": "cinematic-ascii-video",
        "version": storyboard.version,
        "input": str(input_path),
        "duration_seconds": round(duration, 3),
        "canvas": {"width": args.width, "height": args.height, "fps": args.fps},
        "tts": args.tts,
        "voice": args.voice if args.tts == "edge" else args.say_voice if args.tts == "say" else "",
        "voice_performance": args.voice_performance,
        "edge_rate": args.edge_rate,
        "edge_pitch": args.edge_pitch,
        "scene": args.scene,
        "look": look_name,
        "formats": sorted(requested_formats),
        "intro_seal_seconds": args.intro_seal_seconds,
        "cold_open_seconds": args.cold_open_seconds,
        "platform_url": args.platform_url,
        "seed_offset": args.seed_offset,
        "plate_dir": str(args.plate_dir.expanduser().resolve()) if args.plate_dir else "",
        "illustrated_protocol": illustrated_summary,
        "assets": assets,
    })
    assets["manifest"] = str(manifest)
    return assets


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.command == "stills":
        written = stills.render_stills(args.storyboard, args.out, args.look)
        for path in written:
            print(path)
        if args.contact_sheet:
            sheet_path = Path(args.out) / "contact-sheet.png"
            print(stills.contact_sheet(written, sheet_path, look_name=args.look))
        return 0

    if args.command == "bench":
        renderer = frames.Renderer(tokens.load_look(args.look))
        chapter = LegacyChapter(motif="network", keyword="K", anchors=["K"],
                                seed=5, density=0.5, motion=0.5)
        if args.world != "none":
            chapter.world = args.world
            chapter.hero_subject = "K"
            chapter.archetype = "flow"
            chapter.composition = "bridge"
            chapter.depth_layers = 4
            chapter.lighting = "beacon"
            chapter.metamorphosis = "attention-builds-place"
        renderer.frame(chapter, 0.0, 0.0, 0)
        start = time.perf_counter()
        for i in range(args.frames):
            renderer.frame(chapter, i / 30.0, i / 100.0, i)
        elapsed = time.perf_counter() - start
        print(f"frames_per_second={args.frames / elapsed:.2f}")
        return 0

    if args.command == "render":
        if args.width <= 0 or args.height <= 0 or args.fps <= 0:
            raise SystemExit("Canvas dimensions and FPS must be positive")
        if args.intro_seal_seconds < 0:
            raise SystemExit("--intro-seal-seconds cannot be negative")
        if args.cold_open_seconds < 0:
            raise SystemExit("--cold-open-seconds cannot be negative")
        if args.persona != "none":
            print(
                "Note: the persona figure was removed; --persona is now a no-op and is ignored.",
                file=sys.stderr,
            )
        assets = run_render(args)
        print(json.dumps(assets, ensure_ascii=False, indent=2))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
