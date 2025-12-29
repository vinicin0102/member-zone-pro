import { Lock, Play, Crown } from 'lucide-react';
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
  duration?: string;
}

export const ModuleCardImage = ({
  title,
  imageUrl,
  progress = 0,
  isLocked = false,
  isPremium = false,
  className,
  onClick,
  lessonsCount,
  duration
}: ModuleCardImageProps) => {
  return (
    <div
      className={cn(
        'netflix-card relative flex-shrink-0 cursor-pointer group',
        'w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px]',
        className
      )}
      onClick={onClick}
    >
      {/* Card Container with 16:9 aspect ratio */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md bg-zinc-900">
        {/* Background Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              'netflix-card-image absolute inset-0 w-full h-full object-cover',
              isLocked && 'grayscale brightness-[0.4]'
            )}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-10 h-10 text-white/20" />
            </div>
          </div>
        )}

        {/* Dark gradient overlay */}
        {!isLocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        )}

        {/* Progress bar at top */}
        {!isLocked && progress > 0 && (
          <div className="absolute top-0 left-0 right-0 netflix-progress">
            <div
              className="netflix-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Progress percentage badge */}
        {!isLocked && progress > 0 && (
          <div className="absolute top-2 left-2">
            <span className="netflix-card-badge">
              {progress}%
            </span>
          </div>
        )}

        {/* Premium badge */}
        {isLocked && (
          <div className="absolute top-2 right-2">
            <span className="netflix-premium-tag">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="netflix-lock-overlay">
            <div className="netflix-lock-icon">
              <Lock className="h-5 w-5 text-white/90" />
            </div>
            <span className="text-white/70 text-xs font-medium mt-2">
              Conteúdo bloqueado
            </span>
          </div>
        )}

        {/* Play button on hover */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="netflix-play-btn">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Bottom info section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <h3 className="netflix-card-title text-sm sm:text-base md:text-lg line-clamp-2">
            {title}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1.5">
            {lessonsCount && !isLocked && (
              <span className="text-white/60 text-[11px] sm:text-xs font-medium">
                {lessonsCount} aulas
              </span>
            )}
            {duration && !isLocked && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-white/60 text-[11px] sm:text-xs font-medium">
                  {duration}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
