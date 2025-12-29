import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContinueCardProps {
  moduleTitle: string;
  lessonTitle: string;
  lessonNumber: string;
  imageUrl?: string | null;
  progress?: number;
  duration?: string;
  onClick?: () => void;
}

export const LessonContinueCard = ({
  moduleTitle,
  lessonTitle,
  lessonNumber,
  imageUrl,
  progress = 0,
  duration,
  onClick
}: LessonContinueCardProps) => {
  return (
    <div
      className={cn(
        'netflix-card relative flex-shrink-0 cursor-pointer group',
        'w-[160px] sm:w-[200px] md:w-[260px] lg:w-[280px]'
      )}
      onClick={onClick}
    >
      {/* Card with 16:9 aspect ratio */}
      <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden bg-zinc-900">
        {/* Background */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={lessonTitle}
            className="netflix-card-image absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-8 h-8 text-white/20" />
            </div>
          </div>
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 netflix-progress">
          <div
            className="netflix-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-black/70 text-white/90 backdrop-blur-sm">
              {duration}
            </span>
          </div>
        )}

        {/* Play icon - center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="netflix-play-btn">
            <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* "Continue assistindo" indicator */}
        {progress > 0 && progress < 100 && (
          <div className="absolute top-2 left-2">
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-primary text-white">
              Continuar
            </span>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
          {/* Module title - subtle */}
          <p className="text-white/50 text-[10px] sm:text-xs font-medium truncate mb-0.5">
            {moduleTitle}
          </p>

          {/* Lesson title */}
          <h3 className="netflix-card-title text-xs sm:text-sm leading-tight line-clamp-2">
            {lessonTitle}
          </h3>

          {/* Lesson number */}
          <p className="text-white/40 text-[9px] sm:text-[10px] mt-1">
            {lessonNumber}
          </p>
        </div>
      </div>
    </div>
  );
};
