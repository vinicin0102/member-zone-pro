import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VideoPlayerVTurb } from '@/components/members/VideoPlayerVTurb';
import { ProgressBar } from '@/components/members/ProgressBar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Crown } from 'lucide-react';

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description_html: string | null;
  video_vturb_url: string | null;
  order: number;
  is_premium: boolean;
}

interface Module {
  id: string;
  title: string;
}

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [allLessons, setAllLessons] = useState<{ id: string; order: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalProgress, setTotalProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) return;

      try {
        // Fetch lesson
        const { data: lessonData } = await supabase
          .from('courses_lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle();

        if (!lessonData) {
          navigate('/members');
          return;
        }

        // Check premium access
        if (lessonData.is_premium && !isPremium) {
          navigate('/upgrade');
          return;
        }

        setLesson(lessonData);

        // Fetch module
        const { data: moduleData } = await supabase
          .from('courses_modules')
          .select('id, title')
          .eq('id', lessonData.module_id)
          .maybeSingle();

        if (moduleData) {
          setModule(moduleData);

          // Fetch all lessons in module for navigation
          const { data: lessonsData } = await supabase
            .from('courses_lessons')
            .select('id, order')
            .eq('module_id', lessonData.module_id)
            .order('order');

          if (lessonsData) {
            setAllLessons(lessonsData);
          }
        }

        // Check completion status
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lessons_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

          setIsCompleted(progressData?.completed || false);

          // Get total progress
          const { data: allProgress } = await supabase
            .from('user_lessons_progress')
            .select('completed')
            .eq('user_id', user.id);

          const { count: totalLessons } = await supabase
            .from('courses_lessons')
            .select('*', { count: 'exact', head: true });

          setTotalProgress({
            completed: allProgress?.filter(p => p.completed).length || 0,
            total: totalLessons || 0
          });
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, user, isPremium, navigate]);

  const handleMarkComplete = async () => {
    if (!user || !lessonId) return;

    setMarking(true);
    try {
      const { error } = await supabase
        .from('user_lessons_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      setIsCompleted(!isCompleted);
      setTotalProgress(prev => ({
        ...prev,
        completed: !isCompleted ? prev.completed + 1 : prev.completed - 1
      }));

      toast({
        title: !isCompleted ? 'Aula concluída!' : 'Marcação removida',
        description: !isCompleted ? 'Parabéns pelo progresso!' : ''
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o progresso.',
        variant: 'destructive'
      });
    } finally {
      setMarking(false);
    }
  };

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

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

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aula não encontrada</h1>
          <Button onClick={() => navigate('/members')}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/members/module/${lesson.module_id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">{module?.title}</p>
              <h1 className="font-display font-semibold">{lesson.title}</h1>
            </div>
          </div>
          {lesson.is_premium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-premium/10 text-premium text-sm font-medium">
              <Crown className="w-4 h-4" />
              Premium
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Video Player */}
          {lesson.video_vturb_url && (
            <div className="mb-6 animate-fade-in">
              <VideoPlayerVTurb 
                videoUrl={lesson.video_vturb_url} 
                title={lesson.title}
              />
            </div>
          )}

          {/* Lesson Info */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Actions */}
              <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
                <h2 className="font-display text-2xl font-bold mb-4">{lesson.title}</h2>
                
                {lesson.description_html && (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: lesson.description_html }}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {prevLesson && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/members/lesson/${prevLesson.id}`)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}
                {nextLesson && (
                  <Button
                    onClick={() => navigate(`/members/lesson/${nextLesson.id}`)}
                    className="flex-1"
                  >
                    Próxima
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Progress Card */}
              <div className="bg-card rounded-xl border border-border p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h3 className="font-semibold mb-4">Seu Progresso</h3>
                <ProgressBar 
                  value={totalProgress.completed} 
                  max={totalProgress.total} 
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {totalProgress.completed} de {totalProgress.total} aulas
                </p>
              </div>

              {/* Mark Complete Button */}
              <Button
                onClick={handleMarkComplete}
                disabled={marking}
                variant={isCompleted ? 'secondary' : 'default'}
                className="w-full gap-2"
              >
                {marking ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                {isCompleted ? 'Concluída' : 'Marcar como concluída'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
