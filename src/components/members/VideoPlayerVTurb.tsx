import { cn } from '@/lib/utils';

interface VideoPlayerVTurbProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export const VideoPlayerVTurb = ({ videoUrl, title, className }: VideoPlayerVTurbProps) => {
  // Extract video ID from VTurb URL if needed
  const getEmbedUrl = (url: string) => {
    // If it's already an embed URL, use it directly
    if (url.includes('iframe') || url.includes('embed')) {
      return url;
    }
    // VTurb typically uses this format
    return url;
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative w-full rounded-xl overflow-hidden bg-secondary aspect-video">
        <iframe
          src={getEmbedUrl(videoUrl)}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
