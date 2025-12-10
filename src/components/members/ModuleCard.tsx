import { BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string | null;
  lessonsCount: number;
  completedLessons: number;
  onClick: () => void;
}

export const ModuleCard = ({
  id,
  title,
  description,
  lessonsCount,
  completedLessons,
  onClick
}: ModuleCardProps) => {
  const progress = lessonsCount > 0 ? (completedLessons / lessonsCount) * 100 : 0;
  const isComplete = completedLessons === lessonsCount && lessonsCount > 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
        'animate-fade-in'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-lg transition-colors',
              isComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
            )}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{lessonsCount} aulas</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <ProgressBar value={completedLessons} max={lessonsCount} />
      </CardContent>
    </Card>
  );
};
