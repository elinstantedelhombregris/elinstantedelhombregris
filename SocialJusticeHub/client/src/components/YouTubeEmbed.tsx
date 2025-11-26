import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  thumbnail?: string;
  className?: string;
}

export default function YouTubeEmbed({ 
  videoId, 
  title = "Video del Hombre Gris",
  thumbnail,
  className = ""
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from URL if full URL is provided
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const actualVideoId = extractVideoId(videoId);
  const embedUrl = `https://www.youtube.com/embed/${actualVideoId}?autoplay=1&rel=0&modestbranding=1`;
  
  // Generate thumbnail URL if not provided
  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${actualVideoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsLoaded(true);
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {!isLoaded ? (
        <div 
          className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
          onClick={handlePlay}
        >
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to default thumbnail if maxresdefault fails
              const target = e.target as HTMLImageElement;
              target.src = `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`;
            }}
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-all duration-300 group-hover:bg-opacity-50">
            <div className="bg-red-600 rounded-full p-4 transition-transform duration-300 group-hover:scale-110">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
          </div>

          {/* Video title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-medium text-lg leading-tight">
              {title}
            </h3>
          </div>

          {/* Loading indicator */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            YouTube
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
          />
          
          {/* Video info overlay */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            YouTube
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoaded && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}

// Helper function to extract video ID from various YouTube URL formats
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    /youtube\.com\/watch\?v=([^"&?\/\s]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
