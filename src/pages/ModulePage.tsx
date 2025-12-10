import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LessonItem } from '@/components/members/LessonItem';
import { ProgressBar } from '@/components/members/ProgressBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string | null;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  is_premium: boolean;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!moduleId) return;

      try {
        // Fetch module
        const { data: moduleData } = await supabase
          .from('courses_modules')
          .select('*')
          .eq('id', moduleId)
          .maybeSingle();

        if (moduleData) {
          setModule(moduleData);
        }

        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('courses_lessons')
          .select('id, title, order, is_premium')
          .eq('module_id', moduleId)
          .order('order');

        if (lessonsData) {
          setLessons(lessonsData);
        }

        // Fetch user progress
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lessons_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);

          if (progressData) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error('Error fetching module:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, user]);

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const isLessonLocked = (lesson: Lesson) => {
    return lesson.is_premium && !isPremium;
  };

  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Módulo não encontrado</h1>
          <Button onClick={() => navigate('/members')}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold">{module.title}</h1>
            <p className="text-sm text-muted-foreground">
              {completedCount} de {lessons.length} aulas concluídas
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Module Info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-semibold text-xl">{module.title}</h2>
              {module.description && (
                <p className="text-muted-foreground mt-1">{module.description}</p>
              )}
            </div>
          </div>
          <ProgressBar value={completedCount} max={lessons.length} />
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-4">Aulas</h3>
          
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma aula disponível neste módulo.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
              {lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  order={lesson.order}
                  isPremium={lesson.is_premium}
                  isCompleted={isLessonCompleted(lesson.id)}
                  isLocked={isLessonLocked(lesson)}
                  onClick={() => {
                    if (!isLessonLocked(lesson)) {
                      navigate(`/members/lesson/${lesson.id}`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModulePage;
