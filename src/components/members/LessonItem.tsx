import { CheckCircle2, Circle, Crown, PlayCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  id: string;
  title: string;
  order: number;
  isPremium: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  isActive?: boolean;
  onClick: () => void;
}

export const LessonItem = ({
  id,
  title,
  order,
  isPremium,
  isCompleted,
  isLocked,
  isActive = false,
  onClick
}: LessonItemProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-200',
        'hover:bg-secondary/50 text-left',
        isActive && 'bg-primary/10 border border-primary/30',
        isLocked && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
        isCompleted ? 'bg-success text-success-foreground' : 'bg-secondary text-secondary-foreground'
      )}>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isLocked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <span>{order}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            isActive && 'text-primary'
          )}>
            {title}
          </span>
          {isPremium && (
            <Crown className="w-4 h-4 text-premium flex-shrink-0" />
          )}
        </div>
      </div>
      
      {!isLocked && !isCompleted && (
        <PlayCircle className={cn(
          'w-5 h-5 flex-shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )} />
      )}
    </button>
  );
};
