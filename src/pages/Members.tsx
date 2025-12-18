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
import { Menu, Bell, Handshake, Settings, User, LogOut, ChevronDown, FileText, Image, BarChart3, MessageSquare } from 'lucide-react';
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
    continue_watching_title: 'Continue assistindo',
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
  const [userCourseAccess, setUserCourseAccess] = useState<string[]>([]); // IDs dos cursos que o usuário tem acesso
  const [loading, setLoading] = useState(false); // Iniciar como false para não bloquear render
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
            continue_watching_title: configMap.continue_watching_title || 'Continue assistindo',
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
    const continueLessons = lessons.slice(0, 5).map(lesson => {
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum curso encontrado.</p>
          </div>
        );
      }

      return coursesWithModules.map(({ course, modules: courseModules }) => {
        if (courseModules.length === 0) return null;

        const isCourseLocked = !hasCourseAccess(course.id);

        const renderCourseModules = () => {
          if (layoutConfig.modules_layout_type === 'grid') {
            const gridCols = {
              '2': 'grid-cols-1 md:grid-cols-2',
              '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }[layoutConfig.modules_grid_columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            
            return (
              <div className={`grid ${gridCols} gap-6`}>
                {courseModules.map((module) => {
                  const progress = getModuleProgress(module.id);
                  return (
                    <ModuleCardImage
                      key={module.id}
                      title={module.title.toUpperCase()}
                      imageUrl={module.image_url}
                      progress={progress}
                      isLocked={isCourseLocked}
                      onClick={() => {
                        console.log('Módulo clicado:', {
                          moduleTitle: module.title,
                          courseId: course.id,
                          courseTitle: course.title,
                          isCourseLocked,
                          courseIsLocked: course.is_locked,
                          hasAccess: hasCourseAccess(course.id)
                        });
                        if (!isCourseLocked) {
                          navigate(`/members/module/${module.id}`);
                        } else {
                          console.log('Abrindo dialog de oferta para curso:', course.title);
                          setSelectedCourse(course);
                          setOfferDialogOpen(true);
                        }
                      }}
                    />
                  );
                })}
              </div>
            );
          }

          if (layoutConfig.modules_layout_type === 'list') {
            return (
              <div className="space-y-3">
                {courseModules.map((module) => {
                  const progress = getModuleProgress(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => {
                        console.log('Módulo clicado:', {
                          moduleTitle: module.title,
                          courseId: course.id,
                          courseTitle: course.title,
                          isCourseLocked,
                          courseIsLocked: course.is_locked,
                          hasAccess: hasCourseAccess(course.id)
                        });
                        if (!isCourseLocked) {
                          navigate(`/members/module/${module.id}`);
                        } else {
                          console.log('Abrindo dialog de oferta para curso:', course.title);
                          setSelectedCourse(course);
                          setOfferDialogOpen(true);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 bg-card border border-border rounded-lg transition-colors cursor-pointer ${
                        isCourseLocked ? 'opacity-60' : 'hover:border-primary/50'
                      }`}
                    >
                      {module.image_url && (
                        <img 
                          src={module.image_url} 
                          alt={module.title}
                          className={`w-24 h-24 rounded-lg object-cover flex-shrink-0 ${
                            isCourseLocked ? 'grayscale' : ''
                          }`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{module.description}</p>
                        )}
                        <div className="mt-2">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{progress}% concluído</p>
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
              {courseModules.map((module) => {
                const progress = getModuleProgress(module.id);
                return (
                  <ModuleCardImage
                    key={module.id}
                    title={module.title.toUpperCase()}
                    imageUrl={module.image_url}
                    progress={progress}
                    isLocked={isCourseLocked}
                    onClick={() => {
                      if (!isCourseLocked) {
                        navigate(`/members/module/${module.id}`);
                      } else {
                        console.log('Abrindo dialog de oferta para curso (horizontal scroll):', course.title);
                        setSelectedCourse(course);
                        setOfferDialogOpen(true);
                      }
                    }}
                  />
                );
              })}
            </HorizontalScrollSection>
          );
        };

        return (
        <div key={course.id} className="space-y-4">
          {/* Cabeçalho do Curso */}
          <div className="flex items-center gap-4">
            {course.image_url && (
              <img 
                src={course.image_url} 
                alt={course.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">{course.title}</h2>
              {course.description && (
                <p className="text-muted-foreground mt-1">{course.description}</p>
              )}
            </div>
          </div>
          
          {/* Módulos do Curso */}
          {renderCourseModules()}
        </div>
      );
    });
    } catch (error: any) {
      console.error('Error rendering modules by course:', error);
      return (
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar cursos. Tente recarregar a página.</p>
        </div>
      );
    }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  const userInitial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  // Debug: Verificar status de admin
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Banner */}
      <header className="relative bg-gradient-to-br from-primary/20 to-primary/5 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Ferramentas IA</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/members/ia/copy')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>IA de Copy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/members/ia/criativo')}>
                  <Image className="mr-2 h-4 w-4" />
                  <span>IA de Criativo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/members/ia/campanha')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analista de Campanha</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/members/ia/atendimento')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Analista de Atendimento</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2">
              {isAdminUser && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                  onClick={() => navigate('/admin')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-6 w-6" />
              </Button>
              
              {/* Menu do Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white bg-white/10 hover:bg-white/20 rounded-full h-10 px-3 gap-2"
                  >
                    <span className="text-sm font-semibold">{userInitial}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/members')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  {isAdminUser && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Painel Admin</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isPremium && (
                    <DropdownMenuItem disabled>
                      <span className="text-premium">⭐ Premium Ativo</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Banner com Logo */}
          <div className="relative h-32 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl overflow-hidden mb-6">
            <div className="absolute inset-0 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                {siteSettings?.logo_url ? (
                  <img 
                    src={siteSettings.logo_url} 
                    alt={siteSettings.platform_name || 'Logo'} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {siteSettings?.header_title || siteSettings?.platform_name || 'Area De Mentorados'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Promocional - Abaixo do Header */}
      {siteSettings?.banner_image_url && (
        <div 
          className={`relative w-full ${siteSettings.banner_redirect_url ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (siteSettings.banner_redirect_url) {
              window.open(siteSettings.banner_redirect_url, '_blank');
            }
          }}
        >
          <img 
            src={siteSettings.banner_image_url} 
            alt={siteSettings.banner_text || 'Banner'} 
            className="w-full object-cover"
            style={{ maxHeight: '200px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {siteSettings.banner_text && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-white font-semibold text-lg px-4 text-center">
                {siteSettings.banner_text}
              </p>
            </div>
          )}
        </div>
      )}

      <main className="container mx-auto px-4 py-6 space-y-12">
        {/* Cursos com seus Módulos */}
        {renderModulesByCourse()}

        {/* Seção Continue assistindo */}
        {layoutConfig.show_continue_watching && lessons.length > 0 && (
          <HorizontalScrollSection title={layoutConfig.continue_watching_title}>
            {getContinueWatchingLessons().map((lesson) => {
              return (
                <LessonContinueCard
                  key={lesson.id}
                  moduleTitle={lesson.moduleTitle}
                  lessonTitle={lesson.title}
                  lessonNumber={`Aula ${lesson.order}) ${lesson.title}`}
                  progress={lesson.progress}
                  onClick={() => navigate(`/members/lesson/${lesson.id}`)}
                />
              );
            })}
          </HorizontalScrollSection>
        )}

        {/* Seção Acelerador de Resultados */}
        {layoutConfig.show_accelerator && (
          <HorizontalScrollSection title={layoutConfig.accelerator_title}>
            <div className="flex-shrink-0 w-[280px] h-[180px] rounded-xl bg-card border border-border flex items-center justify-center">
              <p className="text-muted-foreground">Em breve</p>
            </div>
          </HorizontalScrollSection>
        )}
      </main>

      {/* Dialog de Oferta do Curso */}
      <CourseOfferDialog
        open={offerDialogOpen && selectedCourse !== null}
        onOpenChange={(open) => {
          console.log('📱 Dialog onOpenChange:', { open, courseTitle: selectedCourse?.title });
          setOfferDialogOpen(open);
          if (!open) {
            // Pequeno delay para permitir animação de fechamento
            setTimeout(() => {
              console.log('🔒 Fechando dialog e limpando selectedCourse');
              setSelectedCourse(null);
            }, 200);
          }
        }}
        courseTitle={selectedCourse?.title || ''}
        courseDescription={selectedCourse?.description || null}
        videoEmbedCode={selectedCourse?.offer_video_url || null}
        purchaseUrl={selectedCourse?.purchase_url || null}
        onPurchaseClick={() => {
          console.log('🛒 Botão de compra clicado:', {
            purchaseUrl: selectedCourse?.purchase_url,
            courseTitle: selectedCourse?.title
          });
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
