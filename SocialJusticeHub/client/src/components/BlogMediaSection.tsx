import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Video, Play, Pause, Volume2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

/**
 * Media configuration for blog posts that have associated podcast/video content.
 * Add entries here keyed by post slug when NotebookLM media is available.
 */
interface PostMediaConfig {
  audioUrl?: string;
  videoUrl?: string; // YouTube video ID or local path
  videoType?: 'youtube' | 'local';
  podcastTitle?: string;
  podcastDescription?: string;
}

const POST_MEDIA: Record<string, PostMediaConfig> = {
  'el-abrazo-que-no-supimos-sostener': {
    // === INSTRUCCIONES ===
    // 1. Generá el podcast en NotebookLM con el archivo notebooklm_source.md
    // 2. Descargá el audio y guardalo en: public/audio/podcast-el-abrazo.mp3
    // 3. Si tenés video, guardalo en: public/video/video-el-abrazo.mp4
    //    O usá un YouTube ID: videoUrl: 'TU_YOUTUBE_ID', videoType: 'youtube'
    // 4. Descomentá las líneas de abajo y borrá los placeholders:
    
    audioUrl: '/audio/podcast-el-abrazo.mp3',
    // videoUrl: '/video/video-el-abrazo.mp4',
    // videoType: 'local',
    // videoUrl: 'YOUTUBE_VIDEO_ID',
    // videoType: 'youtube',
    podcastTitle: '🎙️ Escuchá este artículo',
    podcastDescription: 'Podcast generado con IA — una conversación en español rioplatense sobre las ideas de este artículo.',
  },
};

interface BlogMediaSectionProps {
  slug: string;
}

export default function BlogMediaSection({ slug }: BlogMediaSectionProps) {
  const media = POST_MEDIA[slug];
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'podcast' | 'video'>(
    media?.audioUrl ? 'podcast' : 'video'
  );

  if (!media || (!media.audioUrl && !media.videoUrl)) {
    return null;
  }

  const hasAudio = !!media.audioUrl;
  const hasVideo = !!media.videoUrl;
  const hasBoth = hasAudio && hasVideo;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-b border-indigo-100">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-8 md:px-12 py-4 flex items-center justify-between group cursor-pointer hover:bg-white/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Multimedia
              </h3>
              <p className="text-xs text-slate-500">
                {hasAudio && hasVideo
                  ? 'Podcast y video disponibles'
                  : hasAudio
                  ? 'Escuchá este artículo como podcast'
                  : 'Mirá el video de este artículo'}
              </p>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-8 md:px-12 pb-6">
                {/* Tab Switcher (only if both audio and video exist) */}
                {hasBoth && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab('podcast')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'podcast'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/60'
                          : 'bg-white/70 text-slate-600 hover:bg-white border border-slate-200'
                      }`}
                    >
                      <Headphones className="w-4 h-4" />
                      Podcast
                    </button>
                    <button
                      onClick={() => setActiveTab('video')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'video'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-200/60'
                          : 'bg-white/70 text-slate-600 hover:bg-white border border-slate-200'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </button>
                  </div>
                )}

                {/* Podcast Player */}
                {hasAudio && (activeTab === 'podcast' || !hasBoth) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {media.podcastTitle && (
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          {media.podcastTitle}
                        </span>
                      </div>
                    )}
                    {media.podcastDescription && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {media.podcastDescription}
                      </p>
                    )}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                      <audio
                        controls
                        preload="metadata"
                        className="w-full h-12"
                        style={{ borderRadius: '0.75rem' }}
                      >
                        <source src={media.audioUrl} type="audio/mpeg" />
                        <source src={media.audioUrl?.replace('.mp3', '.wav')} type="audio/wav" />
                        Tu navegador no soporta el reproductor de audio.
                      </audio>
                    </div>
                  </motion.div>
                )}

                {/* Video Player */}
                {hasVideo && (activeTab === 'video' || !hasBoth) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        📺 Mirá el video
                      </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-100 shadow-sm">
                      {media.videoType === 'youtube' ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${media.videoUrl}`}
                            title="Video del artículo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          controls
                          preload="metadata"
                          className="w-full"
                          poster={`${media.videoUrl?.replace(/\.[^.]+$/, '')}-poster.jpg`}
                        >
                          <source src={media.videoUrl} type="video/mp4" />
                          Tu navegador no soporta el reproductor de video.
                        </video>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
