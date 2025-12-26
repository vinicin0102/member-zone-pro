import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContinueCardProps {
  moduleTitle: string;
  lessonTitle: string;
  lessonNumber: string;
  imageUrl?: string | null;
  progress?: number;
  onClick?: () => void;
  duration?: string;
}

export const LessonContinueCard = ({
  moduleTitle,
  lessonTitle,
  lessonNumber,
  imageUrl,
  progress = 0,
  onClick,
  duration
}: LessonContinueCardProps) => {
  return (
    <div
      className={cn(
        'netflix-card relative flex-shrink-0 w-[260px] md:w-[300px] aspect-video',
        'rounded-lg overflow-hidden cursor-pointer group'
      )}
      onClick={onClick}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background Image */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900',
          imageUrl ? 'bg-cover bg-center' : ''
        )}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Progress bar on top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20">
        <div
          className="h-full bg-primary rounded-r-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Badge de continuar assistindo */}
      <div className="absolute top-4 left-3">
        <span className="px-2 py-1 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
          Continuar
        </span>
      </div>

      {/* Play button center */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="p-3 rounded-full bg-white shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
          <Play className="h-6 w-6 text-black fill-current ml-0.5" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1 truncate">
          {moduleTitle}
        </p>
        <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2">
          {lessonTitle}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-white/50 text-xs">{lessonNumber}</p>
          <div className="flex items-center gap-2">
            {duration && (
              <span className="flex items-center gap-1 text-white/50 text-xs">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
            )}
            <span className="text-white/60 text-xs">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
