import {
  Captions,
  Clapperboard,
  Download,
  FileText,
  Monitor,
  Music2,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';

import { ASCII_VIDEOS } from './asciiVideoRegistry.generated';

interface BlogPostAsciiVideoProps {
  slug: string;
}

export function BlogPostAsciiVideo({ slug }: BlogPostAsciiVideoProps) {
  const config = ASCII_VIDEOS[slug];
  const [selectedId, setSelectedId] = useState(config?.variants[0]?.id ?? '');
  if (!config) return null;

  const video = config.variants.find((variant) => variant.id === selectedId) ?? config.variants[0];
  if (!video) return null;
  const isVertical = video.aspect === 'vertical';

  return (
    <section className="my-10 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-200">
            <Clapperboard className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">Video ASCII</p>
            <p className="text-muted-foreground truncate text-xs">{video.eyebrow}</p>
          </div>
        </div>
        <div className="flex rounded-md border border-white/10 bg-black/30 p-1">
          {config.variants.map((variant) => {
            const active = variant.id === video.id;
            const Icon = variant.aspect === 'vertical' ? Smartphone : Monitor;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setSelectedId(variant.id);
                }}
                className={`inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs transition-colors ${
                  active
                    ? 'bg-white/12 text-foreground'
                    : 'text-muted-foreground hover:bg-white/8 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {variant.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className={isVertical ? 'bg-black px-4 py-5' : 'bg-black'}>
        <video
          key={video.id}
          className={`${isVertical ? 'mx-auto aspect-[9/16] max-h-[78vh] w-full max-w-[430px]' : 'aspect-video w-full'} bg-black`}
          controls
          preload="metadata"
          poster={video.posterSrc}
        >
          <source src={video.videoSrc} type="video/mp4" />
          <track kind="subtitles" src={video.subtitlesSrc} srcLang="es" label="Español" default />
        </video>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 bg-white/[0.035] px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Captions className="h-3.5 w-3.5" aria-hidden="true" />
          ES
        </span>
        <a
          href={video.videoSrc}
          className="inline-flex items-center gap-1.5 text-cyan-200 hover:underline"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          MP4
        </a>
        <a
          href={video.soundtrackSrc}
          className="inline-flex items-center gap-1.5 text-cyan-200 hover:underline"
        >
          <Music2 className="h-3.5 w-3.5" aria-hidden="true" />
          Audio
        </a>
        {video.scriptSrc ? (
          <a
            href={video.scriptSrc}
            className="inline-flex items-center gap-1.5 text-cyan-200 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Guion
          </a>
        ) : null}
        {video.subtitlesDownloadSrc ? (
          <a
            href={video.subtitlesDownloadSrc}
            className="inline-flex items-center gap-1.5 text-cyan-200 hover:underline"
          >
            SRT
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default BlogPostAsciiVideo;
