#!/usr/bin/env python3
"""Local web application for the standalone cinematic ASCII video renderer."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import shlex
import shutil
import subprocess
import sys
import threading
import time
import unicodedata
import webbrowser
from dataclasses import asdict, dataclass, field
from email.parser import BytesParser
from email.policy import default
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse


APP_DIR = Path(__file__).resolve().parent
SKILL_DIR = APP_DIR.parent
STATIC_DIR = APP_DIR / "static"
EXAMPLE_FILE = APP_DIR / "examples" / "first-video.md"
RENDERER = SKILL_DIR / "scripts" / "render_cinematic_ascii_video.py"
PYTHON_PACKAGE_DIR = SKILL_DIR / "scripts"
if str(PYTHON_PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(PYTHON_PACKAGE_DIR))
ALLOWED_SOURCE_SUFFIXES = {".txt", ".md", ".mdx"}
DEFAULT_ROOT = Path("~/Movies/CinematicAsciiStudio").expanduser()
DEFAULT_PLATFORM_URL = "www.elinstantedelhombregris.com"
DEFAULT_EDGE_VOICE = "es-AR-TomasNeural"
DEFAULT_EDGE_RATE = "-8%"
DEFAULT_EDGE_PITCH = "-4Hz"
DEFAULT_SAY_VOICE = "Reed (Spanish (Mexico))"
DEFAULT_SAY_RATE = "160"
DEFAULT_VOICE_PERFORMANCE = "editorial"
LOOKS = (
    "plata", "tinta-papel", "tinta-papel-ilustrado", "terminal",
    "blueprint", "archive", "manifesto", "nocturne",
)
FORMATS = ("vertical", "square", "landscape")
DEFAULT_LOGO_CANDIDATES = [
    Path("~/Library/CloudStorage/OneDrive-Personal/Hombre Gris/Cruz Orlada Logo NB.png").expanduser(),
    Path("~/Desktop/ElInstantedelHombreGris/Logo.png").expanduser(),
]
DEFAULT_LOGO = next((path for path in DEFAULT_LOGO_CANDIDATES if path.exists()), None)


@dataclass
class Job:
    id: str
    title: str
    source: str
    output_dir: str
    mode: str
    tts: str
    command: list[str]
    status: str = "queued"
    created_at: float = field(default_factory=time.time)
    started_at: float | None = None
    finished_at: float | None = None
    return_code: int | None = None
    error: str = ""
    assets: list[dict[str, str]] = field(default_factory=list)
    platform_url: str = DEFAULT_PLATFORM_URL
    logo_path: str = ""
    plate_dir: str = ""
    persona: str = "none"  # legacy job-file compatibility; no longer rendered
    intro_seal_seconds: str = "1.6"
    cold_open_seconds: str = "1.25"
    look: str = "plata"
    duration_mode: str = "auto"
    formats: str = "vertical"
    seed_offset: str = "0"
    phase: str = "queued"
    storyboard_review_status: str = "draft"
    approved_chapters: list[str] = field(default_factory=list)
    edge_voice: str = DEFAULT_EDGE_VOICE
    edge_rate: str = DEFAULT_EDGE_RATE
    edge_pitch: str = DEFAULT_EDGE_PITCH
    say_voice: str = DEFAULT_SAY_VOICE
    say_rate: str = DEFAULT_SAY_RATE
    voice_performance: str = DEFAULT_VOICE_PERFORMANCE


class Studio:
    def __init__(self, root: Path):
        self.root = root.expanduser().resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self.jobs_path = self.root / "studio-jobs.json"
        self.jobs: dict[str, Job] = {}
        self.processes: dict[str, subprocess.Popen[str]] = {}
        self.lock = threading.Lock()
        self._load_jobs()

    def _load_jobs(self) -> None:
        if not self.jobs_path.exists():
            return
        try:
            payload = json.loads(self.jobs_path.read_text(encoding="utf-8"))
            for item in payload:
                job = Job(**item)
                if job.status in {"queued", "running"}:
                    job.status = "interrupted"
                    job.error = "The studio closed before this job finished."
                self.jobs[job.id] = job
        except (OSError, ValueError, TypeError):
            self.jobs = {}

    def _save_jobs(self) -> None:
        payload = [asdict(job) for job in sorted(self.jobs.values(), key=lambda item: item.created_at, reverse=True)]
        self.jobs_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    @staticmethod
    def slugify(value: str) -> str:
        normalized = value.encode("ascii", "ignore").decode("ascii").lower()
        return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-") or "video"

    def create_job(self, fields: dict[str, str], upload_name: str, upload_bytes: bytes | None) -> Job:
        job_id = time.strftime("%Y%m%d-%H%M%S") + "-" + os.urandom(2).hex()
        mode = fields.get("mode", "brief")
        if mode not in {"brief", "smoke", "render"}:
            raise ValueError("Unsupported render mode")
        source_path = self._prepare_source(job_id, fields.get("source_path", ""), upload_name, upload_bytes)
        title = fields.get("title", "").strip() or self._infer_title(source_path)
        output_override = fields.get("output_dir", "").strip()
        output_dir = Path(output_override).expanduser().resolve() if output_override else self.root / job_id
        output_dir.mkdir(parents=True, exist_ok=True)
        command = [sys.executable, str(RENDERER), "--input", str(source_path), "--out", str(output_dir)]
        if fields.get("title", "").strip():
            command += ["--title", fields["title"].strip()]
        platform_url = fields.get("platform_url", DEFAULT_PLATFORM_URL).strip() or DEFAULT_PLATFORM_URL
        logo_text = fields.get("logo_path", "").strip()
        plate_text = fields.get("plate_dir", "").strip()
        command += ["--platform-url", platform_url]
        if logo_text:
            logo_path = Path(logo_text).expanduser().resolve()
            if not logo_path.exists():
                raise ValueError(f"Logo not found: {logo_path}")
            command += ["--logo", str(logo_path)]
        if plate_text:
            plate_dir = Path(plate_text).expanduser().resolve()
            if not plate_dir.is_dir():
                raise ValueError(f"Plate directory not found: {plate_dir}")
            command += ["--plate-dir", str(plate_dir)]
        if fields.get("storyboard_path", "").strip():
            storyboard_path = Path(fields["storyboard_path"].strip()).expanduser().resolve()
            if not storyboard_path.exists():
                raise ValueError(f"Storyboard not found: {storyboard_path}")
            command += ["--storyboard", str(storyboard_path)]
        intro_seal_seconds = fields.get("intro_seal_seconds", "1.6").strip() or "1.6"
        cold_open_seconds = fields.get("cold_open_seconds", "1.25").strip() or "1.25"
        try:
            if float(intro_seal_seconds) < 0 or float(cold_open_seconds) < 0:
                raise ValueError
        except ValueError as exc:
            raise ValueError("Reveal durations must be non-negative numbers") from exc
        look = fields.get("look", "plata").strip() or "plata"
        if look not in LOOKS:
            raise ValueError("Unsupported visual look")
        duration_mode = fields.get("duration_mode", "auto").strip() or "auto"
        if duration_mode not in {"auto", "reel", "long"}:
            raise ValueError("Unsupported duration mode")
        formats = fields.get("formats", "vertical").strip() or "vertical"
        selected_formats = {value.strip() for value in formats.split(",") if value.strip()}
        if not selected_formats or selected_formats - set(FORMATS):
            raise ValueError("Formats must be vertical, square, or landscape")
        formats = ",".join(value for value in FORMATS if value in selected_formats)
        seed_offset = fields.get("seed_offset", "0").strip() or "0"
        try:
            int(seed_offset)
        except ValueError as exc:
            raise ValueError("Reroll seed must be a whole number") from exc
        command += [
            "--intro-seal-seconds", intro_seal_seconds,
            "--cold-open-seconds", cold_open_seconds,
            "--look", look,
            "--duration-mode", duration_mode,
            "--formats", formats,
            "--seed-offset", seed_offset,
        ]
        voice_performance = fields.get("voice_performance", DEFAULT_VOICE_PERFORMANCE).strip() or DEFAULT_VOICE_PERFORMANCE
        if voice_performance not in {"flat", "editorial", "dramatic"}:
            raise ValueError("Unsupported voice performance mode")
        command += ["--voice-performance", voice_performance]
        tts = fields.get("tts", "say")
        if tts not in {"edge", "say", "none"}:
            raise ValueError("Unsupported speech mode")
        if mode == "brief":
            command += ["--brief-only"]
        elif mode == "smoke":
            tts = "none"
            command += ["--tts", "none", "--render-seconds", "3", "--width", "540", "--height", "960", "--fps", "6", "--skip-upload"]
        else:
            command += ["--tts", tts]
            if tts == "edge":
                edge_voice = fields.get("edge_voice", DEFAULT_EDGE_VOICE).strip() or DEFAULT_EDGE_VOICE
                edge_rate = fields.get("edge_rate", DEFAULT_EDGE_RATE).strip() or DEFAULT_EDGE_RATE
                edge_pitch = fields.get("edge_pitch", DEFAULT_EDGE_PITCH).strip() or DEFAULT_EDGE_PITCH
                command += ["--voice", edge_voice, "--edge-rate", edge_rate, "--edge-pitch", edge_pitch]
            elif tts == "say":
                say_voice = fields.get("say_voice", DEFAULT_SAY_VOICE).strip() or DEFAULT_SAY_VOICE
                say_rate = fields.get("say_rate", DEFAULT_SAY_RATE).strip() or DEFAULT_SAY_RATE
                if not say_rate.isdigit():
                    raise ValueError("Laptop voice rate must be a positive integer")
                command += ["--say-voice", say_voice, "--say-rate", say_rate]
        job = Job(
            job_id,
            title,
            str(source_path),
            str(output_dir),
            mode,
            tts,
            command,
            platform_url=platform_url,
            logo_path=str(Path(logo_text).expanduser().resolve()) if logo_text else "",
            plate_dir=str(Path(plate_text).expanduser().resolve()) if plate_text else "",
            intro_seal_seconds=intro_seal_seconds,
            cold_open_seconds=cold_open_seconds,
            look=look,
            duration_mode=duration_mode,
            formats=formats,
            seed_offset=seed_offset,
            edge_voice=fields.get("edge_voice", DEFAULT_EDGE_VOICE).strip() or DEFAULT_EDGE_VOICE,
            edge_rate=fields.get("edge_rate", DEFAULT_EDGE_RATE).strip() or DEFAULT_EDGE_RATE,
            edge_pitch=fields.get("edge_pitch", DEFAULT_EDGE_PITCH).strip() or DEFAULT_EDGE_PITCH,
            say_voice=fields.get("say_voice", DEFAULT_SAY_VOICE).strip() or DEFAULT_SAY_VOICE,
            say_rate=fields.get("say_rate", DEFAULT_SAY_RATE).strip() or DEFAULT_SAY_RATE,
            voice_performance=voice_performance,
        )
        with self.lock:
            self.jobs[job.id] = job
            self._save_jobs()
        threading.Thread(target=self._run_job, args=(job.id,), daemon=True).start()
        return job

    @staticmethod
    def _infer_title(source_path: Path) -> str:
        try:
            raw = unicodedata.normalize("NFC", source_path.read_text(encoding="utf-8"))
        except OSError:
            raw = ""
        frontmatter = re.search(r"^---\s*\n(.*?)\n---", raw, flags=re.S)
        if frontmatter:
            match = re.search(r"^title:\s*(.+)$", frontmatter.group(1), flags=re.M)
            if match:
                return match.group(1).strip().strip("\"'")
        heading = re.search(r"^#\s+(.+)$", raw, flags=re.M)
        if heading:
            return heading.group(1).strip()
        return unicodedata.normalize("NFC", source_path.stem).replace("-", " ").replace("_", " ").title()

    def _prepare_source(self, job_id: str, source_text: str, upload_name: str, upload_bytes: bytes | None) -> Path:
        if upload_bytes is not None and upload_name:
            suffix = Path(upload_name).suffix.lower()
            if suffix not in ALLOWED_SOURCE_SUFFIXES:
                raise ValueError("Upload a .txt, .md, or .mdx file")
            source_dir = self.root / job_id / "input"
            source_dir.mkdir(parents=True, exist_ok=True)
            source_path = source_dir / Path(upload_name).name
            source_path.write_bytes(upload_bytes)
            return source_path
        if source_text.strip():
            source_path = Path(source_text.strip()).expanduser().resolve()
            if not source_path.exists():
                raise ValueError(f"Source file not found: {source_path}")
            if source_path.suffix.lower() not in ALLOWED_SOURCE_SUFFIXES:
                raise ValueError("Use a .txt, .md, or .mdx source file")
            return source_path
        raise ValueError("Choose a file or enter a local source path")

    def _run_job(self, job_id: str) -> None:
        with self.lock:
            job = self.jobs[job_id]
            job.status = "running"
            job.phase = "directing" if job.mode == "brief" else "rendering"
            job.started_at = time.time()
            self._save_jobs()
        output_dir = Path(job.output_dir)
        log_path = output_dir / "studio-render.log"
        try:
            with log_path.open("w", encoding="utf-8") as log:
                process = subprocess.Popen(job.command, stdout=log, stderr=subprocess.STDOUT, text=True)
                with self.lock:
                    self.processes[job_id] = process
                return_code = process.wait()
            with self.lock:
                self.processes.pop(job_id, None)
                job.return_code = return_code
                job.finished_at = time.time()
                job.assets = self._assets(output_dir)
                job.status = "done" if return_code == 0 else "failed"
                job.phase = "ready" if return_code == 0 else "needs-attention"
                if return_code:
                    job.error = self._log_tail(log_path)
                self._save_jobs()
        except Exception as exc:  # noqa: BLE001
            with self.lock:
                self.processes.pop(job_id, None)
                job.status = "failed"
                job.phase = "needs-attention"
                job.finished_at = time.time()
                job.error = str(exc)
                job.assets = self._assets(output_dir)
                self._save_jobs()

    def cancel_job(self, job_id: str) -> Job:
        with self.lock:
            job = self.jobs[job_id]
            process = self.processes.get(job_id)
            if process and process.poll() is None:
                process.terminate()
                job.status = "cancelled"
                job.phase = "cancelled"
                job.finished_at = time.time()
                self._save_jobs()
            return job

    def list_jobs(self) -> list[dict[str, object]]:
        with self.lock:
            return [self.public_job(job) for job in sorted(self.jobs.values(), key=lambda item: item.created_at, reverse=True)]

    def get_job(self, job_id: str) -> Job:
        with self.lock:
            if job_id not in self.jobs:
                raise KeyError(job_id)
            return self.jobs[job_id]

    def public_job(self, job: Job) -> dict[str, object]:
        payload = asdict(job)
        normalized_title = unicodedata.normalize("NFC", job.title)
        payload["title"] = normalized_title.title() if any(unicodedata.combining(char) for char in job.title) else normalized_title
        payload["platform_url"] = job.platform_url or self._command_option(job.command, "--platform-url")
        payload["logo_path"] = job.logo_path or self._command_option(job.command, "--logo")
        payload["plate_dir"] = job.plate_dir or self._command_option(job.command, "--plate-dir")
        payload["intro_seal_seconds"] = job.intro_seal_seconds or self._command_option(job.command, "--intro-seal-seconds") or "1.6"
        payload["cold_open_seconds"] = job.cold_open_seconds or self._command_option(job.command, "--cold-open-seconds") or "1.25"
        payload["look"] = job.look or self._command_option(job.command, "--look") or "plata"
        payload["duration_mode"] = job.duration_mode or self._command_option(job.command, "--duration-mode") or "auto"
        payload["formats"] = job.formats or self._command_option(job.command, "--formats") or "vertical"
        payload["seed_offset"] = job.seed_offset or self._command_option(job.command, "--seed-offset") or "0"
        payload["edge_voice"] = job.edge_voice or self._command_option(job.command, "--voice") or DEFAULT_EDGE_VOICE
        payload["edge_rate"] = job.edge_rate or self._command_option(job.command, "--edge-rate") or DEFAULT_EDGE_RATE
        payload["edge_pitch"] = job.edge_pitch or self._command_option(job.command, "--edge-pitch") or DEFAULT_EDGE_PITCH
        payload["say_voice"] = job.say_voice or self._command_option(job.command, "--say-voice") or DEFAULT_SAY_VOICE
        payload["say_rate"] = job.say_rate or self._command_option(job.command, "--say-rate") or DEFAULT_SAY_RATE
        payload["voice_performance"] = job.voice_performance or self._command_option(job.command, "--voice-performance") or DEFAULT_VOICE_PERFORMANCE
        payload["command_text"] = shlex.join(job.command)
        payload["art_direction"] = self._art_direction(Path(job.output_dir))
        payload["log_tail"] = self._log_tail(Path(job.output_dir) / "studio-render.log", 1800)
        storyboards = sorted(
            [asset for asset in job.assets if asset["relative"].endswith("-storyboard.json")],
            key=lambda asset: ("reviewed-storyboard" not in asset["relative"], asset["relative"]),
        )
        payload["followup_storyboard"] = str(Path(job.output_dir) / storyboards[0]["relative"]) if storyboards else ""
        return payload

    def save_storyboard(self, job_id: str, payload: dict[str, object], approve: bool = False) -> Job:
        """Validate and persist the human-reviewed storyboard beside its source draft."""
        from ascii_studio.storyboard.schema import load_storyboard

        job = self.get_job(job_id)
        if not isinstance(payload, dict):
            raise ValueError("Storyboard must be a JSON object")
        slug = self.slugify(job.title)
        reviewed = Path(job.output_dir) / f"{slug}-reviewed-storyboard.json"
        reviewed.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        try:
            storyboard = load_storyboard(reviewed)
        except Exception as exc:  # noqa: BLE001
            reviewed.unlink(missing_ok=True)
            raise ValueError(f"Invalid storyboard: {exc}") from exc
        with self.lock:
            job.assets = self._assets(Path(job.output_dir))
            job.approved_chapters = [chapter.id for chapter in storyboard.chapters] if approve else []
            job.storyboard_review_status = "approved" if approve else "edited"
            self._save_jobs()
        return job

    @staticmethod
    def _command_option(command: list[str], flag: str) -> str:
        try:
            return command[command.index(flag) + 1]
        except (ValueError, IndexError):
            return ""

    def _assets(self, output_dir: Path) -> list[dict[str, str]]:
        if not output_dir.exists():
            return []
        assets = []
        for path in sorted(output_dir.rglob("*")):
            if not path.is_file() or path.name == "studio-render.log":
                continue
            relative = path.relative_to(output_dir)
            assets.append({
                "name": relative.name,
                "relative": str(relative),
                "kind": self._asset_kind(path),
            })
        return assets

    @staticmethod
    def _asset_kind(path: Path) -> str:
        suffix = path.suffix.lower()
        if suffix == ".mp4":
            return "video"
        if suffix in {".jpg", ".jpeg", ".png"}:
            return "image"
        if suffix in {".wav", ".mp3", ".aiff"}:
            return "audio"
        if suffix in {".json", ".md", ".txt", ".srt", ".vtt"}:
            return "text"
        return "file"

    @staticmethod
    def _art_direction(output_dir: Path) -> str:
        matches = list(output_dir.glob("*-art-direction.md"))
        return matches[0].read_text(encoding="utf-8") if matches else ""

    @staticmethod
    def _log_tail(log_path: Path, limit: int = 3000) -> str:
        if not log_path.exists():
            return ""
        return log_path.read_text(encoding="utf-8", errors="replace")[-limit:]

    def file_for(self, job_id: str, relative: str) -> Path:
        job = self.get_job(job_id)
        root = Path(job.output_dir).resolve()
        path = (root / unquote(relative)).resolve()
        if root != path and root not in path.parents:
            raise ValueError("Invalid asset path")
        if not path.is_file():
            raise FileNotFoundError(path)
        return path


def parse_request(handler: BaseHTTPRequestHandler) -> tuple[dict[str, str], str, bytes | None]:
    content_length = int(handler.headers.get("Content-Length", "0"))
    body = handler.rfile.read(content_length)
    content_type = handler.headers.get("Content-Type", "")
    if not content_type.startswith("multipart/form-data"):
        fields = {key: values[-1] for key, values in parse_qs(body.decode("utf-8")).items()}
        return fields, "", None
    envelope = f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8") + body
    message = BytesParser(policy=default).parsebytes(envelope)
    fields: dict[str, str] = {}
    upload_name = ""
    upload_bytes: bytes | None = None
    for part in message.iter_parts():
        name = part.get_param("name", header="content-disposition")
        filename = part.get_filename()
        payload = part.get_payload(decode=True) or b""
        if filename:
            upload_name = filename
            upload_bytes = payload
        elif name:
            fields[name] = payload.decode("utf-8", errors="replace")
    return fields, upload_name, upload_bytes


def read_json_request(handler: BaseHTTPRequestHandler) -> object:
    content_length = int(handler.headers.get("Content-Length", "0"))
    if content_length > 2_000_000:
        raise ValueError("Storyboard payload is too large")
    try:
        return json.loads(handler.rfile.read(content_length).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("Request body must be valid JSON") from exc


class Handler(BaseHTTPRequestHandler):
    studio: Studio

    def log_message(self, format: str, *args: object) -> None:
        print(f"[studio] {self.address_string()} {format % args}", flush=True)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/config":
            self.send_json({
                "output_root": str(self.studio.root),
                "example_path": str(EXAMPLE_FILE),
                "renderer": str(RENDERER),
                "default_platform_url": DEFAULT_PLATFORM_URL,
                "default_logo_path": str(DEFAULT_LOGO) if DEFAULT_LOGO else "",
                "default_edge_voice": DEFAULT_EDGE_VOICE,
                "default_edge_rate": DEFAULT_EDGE_RATE,
                "default_edge_pitch": DEFAULT_EDGE_PITCH,
                "default_say_voice": DEFAULT_SAY_VOICE,
                "default_say_rate": DEFAULT_SAY_RATE,
                "default_voice_performance": DEFAULT_VOICE_PERFORMANCE,
                "looks": list(LOOKS),
                "formats": list(FORMATS),
                "cinema_version": 4,
            })
            return
        if parsed.path == "/api/jobs":
            self.send_json({"jobs": self.studio.list_jobs()})
            return
        match = re.fullmatch(r"/api/jobs/([^/]+)", parsed.path)
        if match:
            try:
                self.send_json(self.studio.public_job(self.studio.get_job(match.group(1))))
            except KeyError:
                self.send_error(HTTPStatus.NOT_FOUND)
            return
        file_match = re.fullmatch(r"/files/([^/]+)/(.*)", parsed.path)
        if file_match:
            try:
                self.send_file(self.studio.file_for(file_match.group(1), file_match.group(2)))
            except (KeyError, ValueError, FileNotFoundError):
                self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_static(parsed.path)

    def do_HEAD(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        file_match = re.fullmatch(r"/files/([^/]+)/(.*)", parsed.path)
        if file_match:
            try:
                self.send_file(self.studio.file_for(file_match.group(1), file_match.group(2)), include_body=False)
            except (KeyError, ValueError, FileNotFoundError):
                self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_static(parsed.path, include_body=False)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/jobs":
            try:
                fields, upload_name, upload_bytes = parse_request(self)
                job = self.studio.create_job(fields, upload_name, upload_bytes)
                self.send_json(self.studio.public_job(job), HTTPStatus.CREATED)
            except ValueError as exc:
                self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return
        match = re.fullmatch(r"/api/jobs/([^/]+)/cancel", parsed.path)
        if match:
            try:
                self.send_json(self.studio.public_job(self.studio.cancel_job(match.group(1))))
            except KeyError:
                self.send_error(HTTPStatus.NOT_FOUND)
            return
        review_match = re.fullmatch(r"/api/jobs/([^/]+)/(storyboard|approve)", parsed.path)
        if review_match:
            try:
                payload = read_json_request(self)
                if not isinstance(payload, dict):
                    raise ValueError("Storyboard must be a JSON object")
                job = self.studio.save_storyboard(
                    review_match.group(1), payload, approve=review_match.group(2) == "approve",
                )
                self.send_json(self.studio.public_job(job))
            except KeyError:
                self.send_error(HTTPStatus.NOT_FOUND)
            except ValueError as exc:
                self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def send_static(self, request_path: str, include_body: bool = True) -> None:
        relative = "index.html" if request_path in {"", "/"} else request_path.lstrip("/")
        path = (STATIC_DIR / relative).resolve()
        if STATIC_DIR.resolve() not in path.parents and path != STATIC_DIR.resolve():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.send_file(path, include_body=include_body)

    def send_file(self, path: Path, include_body: bool = True) -> None:
        content = path.read_bytes()
        content_type, _encoding = mimetypes.guess_type(path.name)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if include_body:
            self.wfile.write(content)

    def send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--host", default="127.0.0.1")
    result.add_argument("--port", type=int, default=8765)
    result.add_argument("--output-root", default=str(DEFAULT_ROOT))
    result.add_argument("--no-browser", action="store_true")
    return result


def main() -> None:
    args = parser().parse_args()
    if not RENDERER.exists():
        raise SystemExit(f"Renderer not found: {RENDERER}")
    Handler.studio = Studio(Path(args.output_root))
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    url = f"http://{args.host}:{args.port}"
    print(f"Cinematic ASCII Studio running at {url}", flush=True)
    print(f"Output directory: {Handler.studio.root}", flush=True)
    if not args.no_browser:
        threading.Timer(0.35, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Cinematic ASCII Studio", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
