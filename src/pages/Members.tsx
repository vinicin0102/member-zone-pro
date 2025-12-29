import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { HorizontalScrollSection } from '@/components/members/HorizontalScrollSection';
import { ModuleCardImage } from '@/components/members/ModuleCardImage';
import { LessonContinueCard } from '@/components/members/LessonContinueCard';
import { CourseOfferDialog } from '@/components/members/CourseOfferDialog';
import {
  Menu, Bell, Settings, User, LogOut, ChevronDown,
  FileText, Image, BarChart3, MessageSquare, Search,
  Sparkles, Play, Crown, Zap, Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  order: number;
  is_locked: boolean;
  offer_video_url?: string | null;
  purchase_url?: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  image_url: string | null;
  course_id: string | null;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order: number;
  is_premium: boolean;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const Members = () => {
  const { user, signOut, isPremium, isAdmin, profile } = useAuth();
  const { settings: siteSettings } = useSiteSettings();
  const [layoutConfig, setLayoutConfig] = useState({
    modules_layout_type: 'horizontal-scroll',
    modules_section_title: 'Método Sociedade',
    show_continue_watching: true,
    continue_watching_title: 'Continuar Assistindo',
    show_accelerator: true,
    accelerator_title: 'Acelerador de Resultados',
    modules_grid_columns: '3'
  });
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsCount, setLessonsCount] = useState<Record<string, number>>({});
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [userCourseAccess, setUserCourseAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // Handle header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug: monitorar mudanças no dialog
  useEffect(() => {
    if (selectedCourse) {
      console.log('✅ selectedCourse atualizado:', {
        title: selectedCourse.title,
        isLocked: selectedCourse.is_locked,
        hasVideoEmbed: !!selectedCourse.offer_video_url,
        hasPurchaseUrl: !!selectedCourse.purchase_url
      });
    }
  }, [selectedCourse]);

  useEffect(() => {
    console.log('🔔 offerDialogOpen mudou para:', offerDialogOpen);
  }, [offerDialogOpen]);

  // Carregar configurações de layout
  useEffect(() => {
    const loadLayoutConfig = async () => {
      try {
        const { data } = await (supabase as any).from('site_settings').select('key, value');
        if (data) {
          const configMap: Record<string, string> = {};
          data.forEach((item: any) => {
            configMap[item.key] = item.value || '';
          });

          setLayoutConfig({
            modules_layout_type: configMap.modules_layout_type || 'horizontal-scroll',
            modules_section_title: configMap.modules_section_title || 'Método Sociedade',
            show_continue_watching: configMap.show_continue_watching !== 'false',
            continue_watching_title: configMap.continue_watching_title || 'Continuar Assistindo',
            show_accelerator: configMap.show_accelerator !== 'false',
            accelerator_title: configMap.accelerator_title || 'Acelerador de Resultados',
            modules_grid_columns: configMap.modules_grid_columns || '3'
          });
        }
      } catch (error) {
        console.error('Error loading layout config:', error);
      }
    };
    loadLayoutConfig();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await (supabase as any)
          .from('courses')
          .select('*')
          .order('order');

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
        }

        if (coursesData && Array.isArray(coursesData)) {
          const mappedCourses = coursesData.map((course: any) => ({
            id: course.id,
            title: course.title || 'Sem título',
            description: course.description || null,
            image_url: course.image_url || null,
            order: course.order || 0,
            is_locked: course.is_locked === true || course.is_locked === 'true' || false,
            offer_video_url: course.offer_video_url || null,
            purchase_url: course.purchase_url || null
          }));
          console.log('📚 Cursos carregados:', mappedCourses.map(c => ({
            title: c.title,
            is_locked: c.is_locked,
            hasOfferVideo: !!c.offer_video_url,
            hasPurchaseUrl: !!c.purchase_url
          })));
          setCourses(mappedCourses);
        } else {
          setCourses([]);
        }

        // Fetch modules (incluindo course_id)
        const { data: modulesData, error: modulesError } = await supabase
          .from('courses_modules')
          .select('*')
          .order('order');

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
        }

        if (modulesData && Array.isArray(modulesData)) {
          // Mapear os dados para garantir que image_url e course_id estão presentes
          const mappedModules = modulesData.map((module: any) => ({
            id: module.id,
            title: module.title || 'Sem título',
            description: module.description || null,
            order: module.order || 0,
            image_url: module.image_url || null,
            course_id: module.course_id || null
          }));
          setModules(mappedModules);
        } else {
          setModules([]);
        }

        // Fetch all lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('courses_lessons')
          .select('id, module_id, title, order, is_premium')
          .order('order');

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
        }

        if (lessonsData && Array.isArray(lessonsData)) {
          setLessons(lessonsData);

          // Count lessons per module
          const counts: Record<string, number> = {};
          modulesData?.forEach((module: any) => {
            counts[module.id] = lessonsData.filter((l: any) => l.module_id === module.id).length;
          });
          setLessonsCount(counts);
        } else {
          setLessons([]);
          setLessonsCount({});
        }

        // Fetch user progress
        if (user) {
          try {
            const [progressResult, accessResult] = await Promise.all([
              supabase
                .from('user_lessons_progress')
                .select('lesson_id, completed')
                .eq('user_id', user.id),
              (supabase as any)
                .from('user_course_access')
                .select('course_id')
                .eq('user_id', user.id)
            ]);

            if (progressResult.data && Array.isArray(progressResult.data)) {
              setUserProgress(progressResult.data);
            } else {
              setUserProgress([]);
            }

            if (accessResult.data && Array.isArray(accessResult.data)) {
              const accessIds = accessResult.data.map((item: any) => item.course_id);
              console.log('✅ Acessos do usuário carregados:', accessIds);
              setUserCourseAccess(accessIds);
            } else {
              console.log('⚠️ Nenhum acesso encontrado para o usuário');
              setUserCourseAccess([]);
            }

            if (accessResult.error) {
              console.error('❌ Erro ao buscar acessos:', accessResult.error);
            }
          } catch (userDataError) {
            console.error('Error fetching user data:', userDataError);
            setUserProgress([]);
            setUserCourseAccess([]);
          }
        } else {
          setUserCourseAccess([]);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: error?.message || 'Tente recarregar a página',
          variant: 'destructive'
        });
        // Garantir que os estados têm valores padrão mesmo em caso de erro
        setCourses([]);
        setModules([]);
        setLessons([]);
        setUserProgress([]);
        setUserCourseAccess([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId);
    if (moduleLessons.length === 0) return 0;

    const completed = userProgress.filter(
      p => p.completed && moduleLessons.some(l => l.id === p.lesson_id)
    ).length;

    return Math.round((completed / moduleLessons.length) * 100);
  };

  const getLessonProgress = (lessonId: string) => {
    const isCompleted = userProgress.some(p => p.lesson_id === lessonId && p.completed);
    return isCompleted ? 100 : 0;
  };

  const getContinueWatchingLessons = () => {
    const continueLessons = lessons.slice(0, 6).map(lesson => {
      const module = modules.find(m => m.id === lesson.module_id);
      return {
        ...lesson,
        moduleTitle: module?.title || '',
        progress: getLessonProgress(lesson.id)
      };
    });
    return continueLessons;
  };

  // Verificar se o usuário tem acesso ao curso
  const hasCourseAccess = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      console.log('❌ Curso não encontrado:', courseId);
      return false;
    }

    // Se o curso não está trancado, todos têm acesso
    if (!course.is_locked) {
      return true;
    }

    // Se está trancado, verificar se o usuário tem acesso
    const hasAccess = userCourseAccess.includes(courseId);
    console.log('🔒 Verificação de acesso:', {
      courseId,
      courseTitle: course.title,
      isLocked: course.is_locked,
      userCourseAccess,
      hasAccess,
      willShowOffer: !hasAccess
    });

    return hasAccess;
  };

  // Agrupar módulos por curso
  const getModulesByCourse = () => {
    const grouped: Record<string, { course: Course; modules: Module[] }> = {};

    // Módulos com curso
    modules.forEach(module => {
      if (module.course_id) {
        const course = courses.find(c => c.id === module.course_id);
        if (course) {
          if (!grouped[course.id]) {
            grouped[course.id] = { course, modules: [] };
          }
          grouped[course.id].modules.push(module);
        }
      }
    });

    // Módulos sem curso (sem course_id ou curso não encontrado)
    const modulesWithoutCourse = modules.filter(m => !m.course_id || !courses.find(c => c.id === m.course_id));
    if (modulesWithoutCourse.length > 0) {
      grouped['no-course'] = {
        course: { id: 'no-course', title: 'Outros', description: null, image_url: null, order: 999, is_locked: false },
        modules: modulesWithoutCourse
      };
    }

    // Ordenar por order do curso
    return Object.values(grouped).sort((a, b) => a.course.order - b.course.order);
  };

  // Renderizar módulos agrupados por curso
  const renderModulesByCourse = () => {
    try {
      const coursesWithModules = getModulesByCourse();

      if (!coursesWithModules || coursesWithModules.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="p-8 rounded-2xl bg-white/5 mb-6 animate-float">
              <Play className="w-16 h-16 text-white/30" />
            </div>
            <h3 className="text-white/80 text-xl font-semibold text-center">
              Nenhum curso disponível
            </h3>
            <p className="text-white/40 text-sm mt-2 text-center max-w-sm">
              Novos conteúdos estão sendo preparados para você. Volte em breve!
            </p>
          </div>
        );
      }

      return coursesWithModules.map(({ course, modules: courseModules }, courseIndex) => {
        if (courseModules.length === 0) return null;

        const isCourseLocked = !hasCourseAccess(course.id);

        const renderCourseModules = () => {
          if (layoutConfig.modules_layout_type === 'grid') {
            const gridCols = {
              '2': 'grid-cols-1 sm:grid-cols-2',
              '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }[layoutConfig.modules_grid_columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

            return (
              <div className={`grid ${gridCols} gap-3 md:gap-4`}>
                {courseModules.map((module, index) => {
                  const progress = getModuleProgress(module.id);
                  return (
                    <div
                      key={module.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <ModuleCardImage
                        title={module.title}
                        imageUrl={module.image_url}
                        progress={progress}
                        isLocked={isCourseLocked}
                        lessonsCount={lessonsCount[module.id]}
                        onClick={() => {
                          if (!isCourseLocked) {
                            navigate(`/members/module/${module.id}`);
                          } else {
                            setSelectedCourse(course);
                            setOfferDialogOpen(true);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          if (layoutConfig.modules_layout_type === 'list') {
            return (
              <div className="space-y-3">
                {courseModules.map((module, index) => {
                  const progress = getModuleProgress(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => {
                        if (!isCourseLocked) {
                          navigate(`/members/module/${module.id}`);
                        } else {
                          setSelectedCourse(course);
                          setOfferDialogOpen(true);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg transition-all cursor-pointer animate-slide-in-right ${isCourseLocked
                        ? 'opacity-60'
                        : 'hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]'
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {module.image_url && (
                        <img
                          src={module.image_url}
                          alt={module.title}
                          className={`w-28 h-16 md:w-36 md:h-20 rounded-md object-cover flex-shrink-0 ${isCourseLocked ? 'grayscale opacity-60' : ''
                            }`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base md:text-lg">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-white/50 mt-1 line-clamp-1">{module.description}</p>
                        )}
                        <div className="mt-3">
                          <div className="netflix-progress">
                            <div
                              className="netflix-progress-bar"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-white/40">{progress}% concluído</p>
                            {lessonsCount[module.id] && (
                              <p className="text-xs text-white/40">{lessonsCount[module.id]} aulas</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          // Layout padrão (horizontal scroll)
          return (
            <HorizontalScrollSection title="">
              {courseModules.map((module, index) => {
                const progress = getModuleProgress(module.id);
                return (
                  <div
                    key={module.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ModuleCardImage
                      title={module.title}
                      imageUrl={module.image_url}
                      progress={progress}
                      isLocked={isCourseLocked}
                      lessonsCount={lessonsCount[module.id]}
                      onClick={() => {
                        if (!isCourseLocked) {
                          navigate(`/members/module/${module.id}`);
                        } else {
                          setSelectedCourse(course);
                          setOfferDialogOpen(true);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </HorizontalScrollSection>
          );
        };

        return (
          <section
            key={course.id}
            className="netflix-row space-y-3 md:space-y-4 pt-6 md:pt-8"
            style={{ animationDelay: `${courseIndex * 150}ms` }}
          >
            {/* Course Header */}
            <div className="flex items-center gap-4">
              {course.image_url && (
                <div className="relative flex-shrink-0">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {isCourseLocked && (
                    <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="netflix-row-title !mb-0">{course.title}</h2>
                  {isCourseLocked && (
                    <span className="netflix-premium-tag">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                {course.description && (
                  <p className="text-white/40 text-sm mt-0.5 line-clamp-1">{course.description}</p>
                )}
              </div>
            </div>

            {/* Course Modules */}
            {renderCourseModules()}
          </section>
        );
      });
    } catch (error: any) {
      console.error('Error rendering modules by course:', error);
      return (
        <div className="text-center py-12">
          <p className="text-red-400">Erro ao carregar cursos. Tente recarregar a página.</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-white/50 text-sm animate-pulse font-medium">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-white/60">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const userInitial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';
  const firstName = profile?.full_name?.split(' ')[0] || 'Membro';

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* Netflix-style Header */}
      <header className={`netflix-header ${isHeaderScrolled ? 'scrolled' : 'netflix-header-gradient'}`}>
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center gap-4 md:gap-8">
              {siteSettings?.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt={siteSettings.platform_name || 'Logo'}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-md flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button className="text-white font-medium text-sm hover:text-white/70 transition-colors">
                  Início
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-white/70 text-sm hover:text-white transition-colors">
                    Ferramentas IA
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                    <DropdownMenuItem onClick={() => navigate('/members/ia/copy')} className="hover:bg-white/10 focus:bg-white/10">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      <span>IA de Copy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/members/ia/criativo')} className="hover:bg-white/10 focus:bg-white/10">
                      <Image className="mr-2 h-4 w-4 text-primary" />
                      <span>IA de Criativo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/members/ia/campanha')} className="hover:bg-white/10 focus:bg-white/10">
                      <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                      <span>Analista de Campanha</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/members/ia/atendimento')} className="hover:bg-white/10 focus:bg-white/10">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                      <span>Analista de Atendimento</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                  <DropdownMenuLabel className="text-white/50">Ferramentas IA</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => navigate('/members/ia/copy')} className="hover:bg-white/10 focus:bg-white/10">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    <span>IA de Copy</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/members/ia/criativo')} className="hover:bg-white/10 focus:bg-white/10">
                    <Image className="mr-2 h-4 w-4 text-primary" />
                    <span>IA de Criativo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/members/ia/campanha')} className="hover:bg-white/10 focus:bg-white/10">
                    <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                    <span>Analista de Campanha</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/members/ia/atendimento')} className="hover:bg-white/10 focus:bg-white/10">
                    <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                    <span>Analista de Atendimento</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>

              {isAdminUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 gap-2 hidden md:flex"
                  onClick={() => navigate('/admin')}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              )}

              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-white/10"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm">
                      {userInitial}
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/70 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold text-white">{profile?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-white/50">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => navigate('/members')} className="hover:bg-white/10 focus:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  {isAdminUser && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-white/10 focus:bg-white/10">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Painel Admin</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                    </>
                  )}
                  {isPremium && (
                    <DropdownMenuItem disabled className="text-amber-400">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Premium Ativo</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <div className="pt-14 md:pt-16">
        {siteSettings?.banner_image_url ? (
          <div className="netflix-hero">
            {/* Banner image */}
            <img
              src={siteSettings.banner_image_url}
              alt="Banner"
              className="netflix-hero-image"
            />

            {/* Gradient overlay */}
            <div className="netflix-hero-gradient" />

            {/* Content */}
            <div className="netflix-hero-content animate-fade-in">
              <h1 className="netflix-hero-title">
                {siteSettings?.header_title || `Olá, ${firstName}!`}
              </h1>
              {siteSettings?.banner_text && (
                <p className="netflix-hero-subtitle">
                  {siteSettings.banner_text}
                </p>
              )}
              <div className="flex items-center gap-3 mt-4 md:mt-6">
                <button className="netflix-btn-primary">
                  <Play className="w-4 h-4 fill-current" />
                  Continuar
                </button>
                <button className="netflix-btn-secondary">
                  <Info className="w-4 h-4" />
                  Mais informações
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 md:px-8 py-8 md:py-12">
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-sm md:text-base text-white/50 mt-2">
                {siteSettings?.header_title || 'Pronto para evoluir?'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="pb-12 md:pb-16 space-y-6 md:space-y-10">
        {/* Continue Watching Section */}
        {layoutConfig.show_continue_watching && lessons.length > 0 && (
          <section className="netflix-row">
            <h2 className="netflix-row-title">{layoutConfig.continue_watching_title}</h2>
            <HorizontalScrollSection title="">
              {getContinueWatchingLessons().map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <LessonContinueCard
                    moduleTitle={lesson.moduleTitle}
                    lessonTitle={lesson.title}
                    lessonNumber={`Aula ${lesson.order}`}
                    progress={lesson.progress}
                    onClick={() => navigate(`/members/lesson/${lesson.id}`)}
                  />
                </div>
              ))}
            </HorizontalScrollSection>
          </section>
        )}

        {/* Courses with Modules */}
        {renderModulesByCourse()}

        {/* Accelerator Section */}
        {layoutConfig.show_accelerator && (
          <section className="netflix-row">
            <h2 className="netflix-row-title">{layoutConfig.accelerator_title}</h2>
            <div className="flex items-center justify-center h-36 md:h-48 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="text-center">
                <div className="p-4 rounded-xl bg-white/5 mx-auto mb-4 w-fit animate-float">
                  <Sparkles className="w-8 h-8 text-primary/60" />
                </div>
                <p className="text-white/40 text-sm font-medium">Em breve!</p>
                <p className="text-white/25 text-xs mt-1">Novos conteúdos exclusivos</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Course Offer Dialog */}
      <CourseOfferDialog
        open={offerDialogOpen && selectedCourse !== null}
        onOpenChange={(open) => {
          setOfferDialogOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedCourse(null);
            }, 200);
          }
        }}
        courseTitle={selectedCourse?.title || ''}
        courseDescription={selectedCourse?.description || null}
        videoEmbedCode={selectedCourse?.offer_video_url || null}
        purchaseUrl={selectedCourse?.purchase_url || null}
        onPurchaseClick={() => {
          if (selectedCourse?.purchase_url) {
            window.open(selectedCourse.purchase_url, '_blank');
          } else {
            toast({
              title: 'Link de compra não configurado',
              description: 'Entre em contato com o suporte.',
              variant: 'destructive'
            });
          }
        }}
      />
    </div>
  );
};

export default Members;
