import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        'relative flex-shrink-0 w-[280px] h-[200px] rounded-xl overflow-hidden cursor-pointer group bg-card border border-border',
        'hover:border-primary/50 transition-all'
      )}
      onClick={onClick}
    >
      {/* Background Image ou placeholder */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20',
          imageUrl ? 'bg-cover bg-center' : ''
        )}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Indicador de progresso */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-semibold">
        {progress}%
      </div>

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="space-y-2">
          <div>
            <p className="text-white/70 text-xs font-medium">{moduleTitle}</p>
            <p className="text-white text-sm font-semibold">{lessonTitle}</p>
            <p className="text-white/80 text-xs mt-1">{lessonNumber}</p>
          </div>
          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-white h-8 text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Play className="h-3 w-3 mr-1" />
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};


