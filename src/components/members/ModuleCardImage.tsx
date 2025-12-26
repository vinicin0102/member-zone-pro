import { Lock, Play, Clock, Star } from 'lucide-react';
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
        'netflix-card relative flex-shrink-0 w-[280px] md:w-[320px] aspect-video cursor-pointer group',
        'scroll-snap-align-start',
        className
      )}
      onClick={onClick}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background Image */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg',
          imageUrl ? 'bg-cover bg-center' : '',
          isLocked && 'grayscale opacity-80'
        )}
        style={imageUrl ? {
          backgroundImage: `url(${imageUrl})`,
          filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none'
        } : {}}
      />

      {/* Hover Overlay */}
      <div className={cn(
        'absolute inset-0 rounded-lg transition-all duration-300',
        isLocked
          ? 'bg-black/70'
          : 'bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-100'
      )} />

      {/* Progress bar on top */}
      {!isLocked && progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Badge de progresso */}
      {!isLocked && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {progress > 0 && progress < 100 && (
            <span className="px-2 py-1 rounded-md bg-primary/90 text-white text-xs font-semibold backdrop-blur-sm">
              {progress}% concluído
            </span>
          )}
          {progress === 100 && (
            <span className="px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3" /> Completo
            </span>
          )}
        </div>
      )}

      {/* Lock icon for locked content */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <Lock className="h-8 w-8 text-white/80" />
          </div>
        </div>
      )}

      {/* Play button on hover (only if not locked) */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="p-4 rounded-full bg-white/95 text-black shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-8 w-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Content on hover */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-4 rounded-b-lg',
        'transform transition-all duration-300',
        'translate-y-0 md:translate-y-2 md:opacity-80 group-hover:translate-y-0 group-hover:opacity-100'
      )}>
        <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-white/70 text-xs">
          {lessonsCount && (
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {lessonsCount} aulas
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          )}
          {!lessonsCount && !duration && (
            <span className="text-primary font-medium">Assistir agora →</span>
          )}
        </div>
      </div>

      {/* Premium badge */}
      {isPremium && !isLocked && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wide shadow-lg">
            Premium
          </span>
        </div>
      )}
    </div>
  );
};
