import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContinueCardProps {
  moduleTitle: string;
  lessonTitle: string;
  lessonNumber: string;
  imageUrl?: string | null;
  progress?: number;
  onClick?: () => void;
}

export const LessonContinueCard = ({
  moduleTitle,
  lessonTitle,
  lessonNumber,
  imageUrl,
  progress = 0,
  onClick
}: LessonContinueCardProps) => {
  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[140px] sm:w-[180px] md:w-[240px] cursor-pointer',
        'transition-transform duration-200 active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      {/* Card with fixed aspect ratio */}
      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-zinc-800">
        {/* Background */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={lessonTitle}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-2 rounded-full bg-white/90 text-black">
            <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white/60 text-[9px] sm:text-[10px] truncate">{moduleTitle}</p>
          <h3 className="text-white font-semibold text-[10px] sm:text-xs leading-tight line-clamp-1">
            {lessonTitle}
          </h3>
        </div>
      </div>
    </div>
  );
};
