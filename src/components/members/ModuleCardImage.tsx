import { Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardImageProps {
  title: string;
  imageUrl?: string | null;
  progress?: number;
  isLocked?: boolean;
  isPremium?: boolean;
  className?: string;
  onClick?: () => void;
  lessonsCount?: number;
}

export const ModuleCardImage = ({
  title,
  imageUrl,
  progress = 0,
  isLocked = false,
  isPremium = false,
  className,
  onClick,
  lessonsCount
}: ModuleCardImageProps) => {
  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[280px] cursor-pointer group',
        'transition-transform duration-200 active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {/* Card Container with fixed aspect ratio */}
      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-zinc-800">
        {/* Background Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              isLocked && 'grayscale brightness-50'
            )}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
        )}

        {/* Overlay */}
        <div className={cn(
          'absolute inset-0',
          isLocked
            ? 'bg-black/60'
            : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
        )} />

        {/* Progress bar */}
        {!isLocked && progress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Progress badge */}
        {!isLocked && progress > 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-primary text-white">
              {progress}%
            </span>
          </div>
        )}

        {/* Lock icon */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-2 sm:p-3 rounded-full bg-black/50 backdrop-blur-sm">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
            </div>
          </div>
        )}

        {/* Play icon on hover (desktop only) */}
        {!isLocked && (
          <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-3 rounded-full bg-white/90 text-black">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Title - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base leading-tight line-clamp-2">
            {title}
          </h3>
          {lessonsCount && !isLocked && (
            <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">
              {lessonsCount} aulas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
