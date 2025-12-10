import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleCard } from '@/components/members/ModuleCard';
import { ProgressBar } from '@/components/members/ProgressBar';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, LogOut, Crown, Settings } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const Members = () => {
  const { user, signOut, isPremium, isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsCount, setLessonsCount] = useState<Record<string, number>>({});
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch modules
        const { data: modulesData } = await supabase
          .from('courses_modules')
          .select('*')
          .order('order');

        if (modulesData) {
          setModules(modulesData);

          // Fetch lessons count per module
          const counts: Record<string, number> = {};
          for (const module of modulesData) {
            const { count } = await supabase
              .from('courses_lessons')
              .select('*', { count: 'exact', head: true })
              .eq('module_id', module.id);
            counts[module.id] = count || 0;
          }
          setLessonsCount(counts);
        }

        // Fetch user progress
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lessons_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);

          if (progressData) {
            setUserProgress(progressData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getCompletedLessonsForModule = async (moduleId: string) => {
    const { data: lessons } = await supabase
      .from('courses_lessons')
      .select('id')
      .eq('module_id', moduleId);

    if (!lessons) return 0;

    const lessonIds = lessons.map(l => l.id);
    const completed = userProgress.filter(
      p => p.completed && lessonIds.includes(p.lesson_id)
    );
    return completed.length;
  };

  const [completedPerModule, setCompletedPerModule] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCompletedCounts = async () => {
      const counts: Record<string, number> = {};
      for (const module of modules) {
        counts[module.id] = await getCompletedLessonsForModule(module.id);
      }
      setCompletedPerModule(counts);
    };

    if (modules.length > 0) {
      fetchCompletedCounts();
    }
  }, [modules, userProgress]);

  const totalLessons = Object.values(lessonsCount).reduce((a, b) => a + b, 0);
  const totalCompleted = userProgress.filter(p => p.completed).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg">Área de Membros</span>
          </div>

          <div className="flex items-center gap-3">
            {isPremium && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-premium/10 text-premium text-sm font-medium">
                <Crown className="w-4 h-4" />
                Premium
              </div>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Settings className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Olá, {profile?.full_name || 'Aluno'}!
          </h1>
          <p className="text-muted-foreground">
            Continue de onde parou e avance nos seus estudos.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Seu Progresso Geral</h2>
              <p className="text-sm text-muted-foreground">
                {totalCompleted} de {totalLessons} aulas concluídas
              </p>
            </div>
          </div>
          <ProgressBar value={totalCompleted} max={totalLessons} size="lg" />
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Módulos do Curso</h2>
          
          {modules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum módulo disponível ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module, index) => (
                <div key={module.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <ModuleCard
                    id={module.id}
                    title={module.title}
                    description={module.description}
                    lessonsCount={lessonsCount[module.id] || 0}
                    completedLessons={completedPerModule[module.id] || 0}
                    onClick={() => navigate(`/members/module/${module.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Members;
