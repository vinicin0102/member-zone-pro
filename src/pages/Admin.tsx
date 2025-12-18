import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, Video, Edit2, X, Check, Settings, Image as ImageIcon, Layout, GraduationCap, Loader2, Upload, XCircle, Grid3x3, User, Mail, MoreVertical, Search, Download, CreditCard, Copy, ExternalLink, CheckCircle2, XCircle as XCircleIcon, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Course { id: string; title: string; description: string | null; image_url: string | null; order: number; is_locked: boolean; offer_video_url?: string | null; purchase_url?: string | null; }
interface Module { id: string; title: string; description: string | null; order: number; course_id: string | null; image_url: string | null; }
interface Lesson { id: string; module_id: string; title: string; description_html: string | null; video_vturb_url: string | null; order: number; is_premium: boolean; }

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', image_url: '', is_locked: false, offer_video_url: '', purchase_url: '' });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState({ title: '', description: '', image_url: '', is_locked: false, offer_video_url: '', purchase_url: '' });
  const [newModule, setNewModule] = useState({ title: '', description: '', course_id: '', image_url: '' });
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editModuleData, setEditModuleData] = useState({ title: '', description: '', course_id: '', image_url: '' });
  const [moduleImageFile, setModuleImageFile] = useState<File | null>(null);
  const [moduleImagePreview, setModuleImagePreview] = useState<string | null>(null);
  const [editingModuleImageFile, setEditingModuleImageFile] = useState<File | null>(null);
  const [editingModuleImagePreview, setEditingModuleImagePreview] = useState<string | null>(null);
  const [uploadingModuleImage, setUploadingModuleImage] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description_html: '', video_vturb_url: '', is_premium: false });
  const [loading, setLoading] = useState(true);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Banner settings
  const [bannerSettings, setBannerSettings] = useState({
    banner_image_url: '',
    banner_text: '',
    banner_redirect_url: ''
  });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  
  // Customization settings
  const [customSettings, setCustomSettings] = useState({
    platform_name: '',
    logo_url: '',
    primary_color: '#8b5cf6',
    theme: 'dark',
    header_title: ''
  });
  const [savingCustom, setSavingCustom] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    support_email: '',
    terms_url: '',
    privacy_url: ''
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Layout settings
  const [layoutSettings, setLayoutSettings] = useState({
    modules_layout_type: 'horizontal-scroll',
    modules_section_title: 'Método Sociedade',
    show_continue_watching: true,
    continue_watching_title: 'Continue assistindo',
    show_accelerator: true,
    accelerator_title: 'Acelerador de Resultados',
    modules_grid_columns: '3'
  });
  const [savingLayout, setSavingLayout] = useState(false);
  
  // Users management
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userCourseAccessList, setUserCourseAccessList] = useState<Record<string, string[]>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    payment_gateway_name: 'asaas',
    payment_gateway_api_key: '',
    payment_gateway_secret: '',
    payment_gateway_webhook_secret: '',
    payment_webhook_url: ''
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchData = async () => {
    try {
      // Buscar cursos
      const { data: coursesData } = await supabase.from('courses').select('*').order('order');
      if (coursesData) setCourses(coursesData);
      
      // Buscar módulos e aulas
      const { data: modulesData } = await supabase.from('courses_modules').select('*').order('order');
      if (modulesData) setModules(modulesData);
      
      const { data: lessonsData } = await supabase.from('courses_lessons').select('*').order('order');
      if (lessonsData) setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao atualizar dados.', 
        variant: 'destructive' 
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });
        
        const bannerImageUrl = settingsMap.banner_image_url || '';
        setBannerSettings({
          banner_image_url: bannerImageUrl,
          banner_text: settingsMap.banner_text || '',
          banner_redirect_url: settingsMap.banner_redirect_url || ''
        });
        
        // Se houver URL de imagem salva, usar como preview
        if (bannerImageUrl && !bannerImageUrl.startsWith('data:')) {
          setBannerImagePreview(null); // Será carregada da URL
        }
        
        setCustomSettings({
          platform_name: settingsMap.platform_name || '',
          logo_url: settingsMap.logo_url || '',
          primary_color: settingsMap.primary_color || '#8b5cf6',
          theme: settingsMap.theme || 'dark',
          header_title: settingsMap.header_title || 'Area De Mentorados'
        });
        
        setGeneralSettings({
          support_email: settingsMap.support_email || '',
          terms_url: settingsMap.terms_url || '',
          privacy_url: settingsMap.privacy_url || ''
        });

        setLayoutSettings({
          modules_layout_type: settingsMap.modules_layout_type || 'horizontal-scroll',
          modules_section_title: settingsMap.modules_section_title || 'Método Sociedade',
          show_continue_watching: settingsMap.show_continue_watching !== 'false',
          continue_watching_title: settingsMap.continue_watching_title || 'Continue assistindo',
          show_accelerator: settingsMap.show_accelerator !== 'false',
          accelerator_title: settingsMap.accelerator_title || 'Acelerador de Resultados',
          modules_grid_columns: settingsMap.modules_grid_columns || '3'
        });
      }
    } catch (settingsError) {
      console.warn('Settings table may not exist yet:', settingsError);
    }
  };

  // Fetch users and their course access
  const fetchPaymentSettings = async () => {
    try {
      const { data } = await (supabase as any).from('site_settings').select('key, value');
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((item: any) => {
          settingsMap[item.key] = item.value || '';
        });
        
        setPaymentSettings({
          payment_gateway_name: settingsMap.payment_gateway_name || 'asaas',
          payment_gateway_api_key: settingsMap.payment_gateway_api_key || '',
          payment_gateway_secret: settingsMap.payment_gateway_secret || '',
          payment_gateway_webhook_secret: settingsMap.payment_gateway_webhook_secret || '',
          payment_webhook_url: settingsMap.payment_webhook_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const testGatewayConnection = async () => {
    if (!paymentSettings.payment_gateway_api_key) {
      toast({ 
        title: 'API Key necessária', 
        description: 'Preencha a API Key antes de testar', 
        variant: 'destructive' 
      });
      return;
    }

    setTestingConnection(true);
    
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const gatewayName = paymentSettings.payment_gateway_name;
      const apiKey = paymentSettings.payment_gateway_api_key.trim();
      let testResult = { success: false, message: '' };

      // Validação básica do formato da API Key
      if (!apiKey) {
        testResult = { 
          success: false, 
          message: '❌ API Key não pode estar vazia' 
        };
      } else if (gatewayName === 'asaas') {
        // Validação básica do formato Asaas
        if (apiKey.length < 10) {
          testResult = { 
            success: false, 
            message: '❌ API Key do Asaas parece estar incompleta (mínimo 10 caracteres)' 
          };
        } else {
          testResult = { 
            success: true, 
            message: '✅ API Key do Asaas configurada corretamente! A validação completa será feita quando o webhook for recebido.' 
          };
        }
      } else if (gatewayName === 'stripe') {
        // Validação básica do formato Stripe (sk_test_ ou sk_live_)
        if (!apiKey.startsWith('sk_')) {
          testResult = { 
            success: false, 
            message: '❌ API Key do Stripe deve começar com "sk_test_" ou "sk_live_"' 
          };
        } else if (apiKey.length < 20) {
          testResult = { 
            success: false, 
            message: '❌ API Key do Stripe parece estar incompleta' 
          };
        } else {
          testResult = { 
            success: true, 
            message: '✅ API Key do Stripe configurada corretamente! A validação completa será feita quando o webhook for recebido.' 
          };
        }
      } else if (gatewayName === 'mercadopago') {
        // Validação básica do formato Mercado Pago (APP_USR-)
        if (!apiKey.startsWith('APP_USR-')) {
          testResult = { 
            success: false, 
            message: '❌ API Key do Mercado Pago deve começar com "APP_USR-"' 
          };
        } else {
          testResult = { 
            success: true, 
            message: '✅ API Key do Mercado Pago configurada corretamente! A validação completa será feita quando o webhook for recebido.' 
          };
        }
      } else {
        // Para outros gateways, apenas valida se a API Key foi preenchida
        if (apiKey.length < 5) {
          testResult = { 
            success: false, 
            message: '❌ API Key parece estar muito curta (mínimo 5 caracteres)' 
          };
        } else {
          testResult = { 
            success: true, 
            message: `✅ API Key configurada para "${gatewayName}"! Configure o webhook no seu gateway para testar completamente.` 
          };
        }
      }

      toast({ 
        title: testResult.success ? '✅ Validação OK!' : '❌ Erro na validação', 
        description: testResult.message,
        variant: testResult.success ? 'default' : 'destructive'
      });

    } catch (error: any) {
      toast({ 
        title: 'Erro ao validar', 
        description: error.message || 'Não foi possível validar a API Key. Verifique o formato.',
        variant: 'destructive' 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const savePaymentSettings = async () => {
    if (!paymentSettings.payment_gateway_api_key?.trim()) {
      toast({ 
        title: 'Campo obrigatório', 
        description: 'A API Key do gateway é obrigatória para salvar as configurações', 
        variant: 'destructive' 
      });
      return;
    }

    if (paymentSettings.payment_gateway_name === 'other') {
      toast({ 
        title: 'Selecione ou digite o nome do gateway', 
        description: 'Selecione um gateway da lista ou digite o nome personalizado se escolheu "Outro"', 
        variant: 'destructive' 
      });
      return;
    }

    setSavingPayment(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const webhookUrl = `${supabaseUrl}/functions/v1/webhook-payment`;
      
      const updates = [
        { key: 'payment_gateway_name', value: paymentSettings.payment_gateway_name },
        { key: 'payment_gateway_api_key', value: paymentSettings.payment_gateway_api_key },
        { key: 'payment_gateway_secret', value: paymentSettings.payment_gateway_secret || '' },
        { key: 'payment_gateway_webhook_secret', value: paymentSettings.payment_gateway_webhook_secret || '' },
        { key: 'payment_webhook_url', value: webhookUrl }
      ];
      
      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      // Atualizar URL do webhook
      setPaymentSettings({ ...paymentSettings, payment_webhook_url: webhookUrl });
      
      toast({ 
        title: '✅ Gateway configurado!', 
        description: `Gateway "${paymentSettings.payment_gateway_name}" salvo com sucesso! Configure o webhook no seu gateway usando a URL abaixo.` 
      });
    } catch (error: any) {
      toast({ 
        title: 'Erro ao salvar', 
        description: error.message || 'Não foi possível salvar as configurações. Tente novamente.', 
        variant: 'destructive' 
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      // Buscar transações
      const { data: transactionsData, error: transactionsError } = await (supabase as any)
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionsError) throw transactionsError;

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([]);
        return;
      }

      // Buscar cursos relacionados
      const courseIds = [...new Set(transactionsData.map((t: any) => t.course_id).filter(Boolean))];
      const { data: coursesData } = courseIds.length > 0 
        ? await (supabase as any).from('courses').select('id, title').in('id', courseIds)
        : { data: [] };

      // Buscar perfis relacionados
      const userIds = [...new Set(transactionsData.map((t: any) => t.user_id).filter(Boolean))];
      const { data: profilesData } = userIds.length > 0
        ? await (supabase as any).from('profiles').select('user_id, email, full_name').in('user_id', userIds)
        : { data: [] };

      // Combinar os dados
      const transactionsWithRelations = transactionsData.map((transaction: any) => {
        const course = coursesData?.find((c: any) => c.id === transaction.course_id) || null;
        const profile = profilesData?.find((p: any) => p.user_id === transaction.user_id) || null;
        
        return {
          ...transaction,
          courses: course,
          profiles: profile
        };
      });

      setTransactions(transactionsWithRelations);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao carregar transações: ' + error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Buscar usuários
      const { data: usersData, error: usersError } = await (supabase as any)
        .from('profiles')
        .select('id, user_id, email, full_name, is_admin, created_at')
        .order('created_at', { ascending: false });
      
      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar usuários: ' + usersError.message,
          variant: 'destructive'
        });
        setLoadingUsers(false);
        return;
      }
      
      if (usersData && usersData.length > 0) {
        // Buscar acessos de cada usuário
        const usersWithAccess = await Promise.all(usersData.map(async (profile: any) => {
          const { data: accessData } = await (supabase as any)
            .from('user_access')
            .select('premium_active, expires_at')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          
          return {
            ...profile,
            premium_active: accessData?.premium_active || false,
            expires_at: accessData?.expires_at || null
          };
        }));
        
        console.log('✅ Usuários carregados:', usersWithAccess.length, 'usuários');
        setUsers(usersWithAccess);
      } else {
        console.log('⚠️ Nenhum usuário encontrado na tabela profiles');
        setUsers([]);
      }
      
      // Buscar acessos de todos os usuários
      const { data: accesses, error: accessError } = await (supabase as any)
        .from('user_course_access')
        .select('user_id, course_id');
      
      if (accessError) {
        console.error('Error fetching course access:', accessError);
        // Não bloquear se a tabela não existir ainda
      } else if (accesses) {
        const grouped: Record<string, string[]> = {};
        accesses.forEach((access: any) => {
          if (!grouped[access.user_id]) grouped[access.user_id] = [];
          grouped[access.user_id].push(access.course_id);
        });
        setUserCourseAccessList(grouped);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar usuários',
        variant: 'destructive'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Função para exportar dados
  const handleExportData = () => {
    const csvContent = [
      ['Nome', 'Email', 'Status', 'Admin', 'Data de Cadastro'].join(','),
      ...users.map(u => [
        `"${(u.full_name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        u.premium_active ? 'Premium' : 'Free',
        u.is_admin ? 'Sim' : 'Não',
        new Date(u.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Sucesso', description: 'Dados exportados com sucesso!' });
  };

  // Filtrar usuários por busca
  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const handleToggleCourseAccess = async (userId: string, courseId: string, grant: boolean) => {
    try {
      if (grant) {
        // Conceder acesso
        const { error } = await (supabase as any)
          .from('user_course_access')
          .upsert({ 
            user_id: userId, 
            course_id: courseId, 
            granted_by: user?.id 
          }, { 
            onConflict: 'user_id,course_id' 
          });
        
        if (error) throw error;
        
        toast({ title: 'Sucesso', description: 'Acesso concedido ao curso' });
        
        // Atualizar state local
        setUserCourseAccessList(prev => ({
          ...prev,
          [userId]: [...(prev[userId] || []), courseId]
        }));
      } else {
        // Remover acesso
        const { error } = await (supabase as any)
          .from('user_course_access')
          .delete()
          .eq('user_id', userId)
          .eq('course_id', courseId);
        
        if (error) throw error;
        
        toast({ title: 'Sucesso', description: 'Acesso removido do curso' });
        
        // Atualizar state local
        setUserCourseAccessList(prev => ({
          ...prev,
          [userId]: (prev[userId] || []).filter(id => id !== courseId)
        }));
      }
    } catch (error: any) {
      toast({ 
        title: 'Erro', 
        description: error.message || 'Erro ao atualizar acesso', 
        variant: 'destructive' 
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
        await fetchSettings();
        await fetchUsers();
        await fetchPaymentSettings();
        await fetchTransactions();
      } catch (error) {
        console.error('Error loading data:', error);
        toast({ 
          title: 'Erro', 
          description: 'Erro ao carregar dados. Verifique sua conexão.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Erro', 
          description: 'Por favor, selecione apenas arquivos de imagem', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: 'Erro', 
          description: 'A imagem deve ter no máximo 5MB', 
          variant: 'destructive' 
        });
        return;
      }
      
      setBannerImageFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setBannerSettings({ ...bannerSettings, banner_image_url: '' });
  };

  // Funções para upload de imagem de módulo
  const uploadModuleImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `module-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('📤 Fazendo upload de imagem de módulo:', fileName);
      
      // Fazer upload para o bucket 'banners' (podemos usar o mesmo bucket)
      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        const errorMsg = uploadError.message || String(uploadError);
        
        if (errorMsg.includes('Bucket not found') || errorMsg.includes('not found')) {
          throw new Error(
            '❌ Bucket "banners" não encontrado.\n\n' +
            '🔧 Crie o bucket "banners" no Supabase Dashboard → Storage e marque como Público.'
          );
        }
        
        if (errorMsg.includes('row-level security') || errorMsg.includes('RLS')) {
          throw new Error(
            '❌ Política RLS bloqueou o upload.\n\n' +
            'Execute o SQL CREATE_BANNER_STORAGE_BUCKET.sql no Supabase SQL Editor.'
          );
        }
        
        throw new Error(`Erro no upload: ${errorMsg}`);
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading module image:', error);
      throw error;
    }
  };

  const handleModuleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditing) {
      setEditingModuleImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingModuleImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setModuleImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setModuleImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeModuleImage = (isEditing: boolean) => {
    if (isEditing) {
      setEditingModuleImageFile(null);
      setEditingModuleImagePreview(null);
      setEditModuleData({ ...editModuleData, image_url: '' });
    } else {
      setModuleImageFile(null);
      setModuleImagePreview(null);
      setNewModule({ ...newModule, image_url: '' });
    }
  };

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('🔍 Verificando bucket "banners"...');
      
      // Tentar verificar se o bucket existe
      let bucketExists = false;
      let bucketInfo = null;
      
      try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (!listError && buckets) {
          console.log('📦 Buckets encontrados:', buckets.map(b => `${b.name} (${b.public ? 'público' : 'privado'})`).join(', '));
          bucketInfo = buckets.find(b => b.name === 'banners');
          bucketExists = !!bucketInfo;
          
          if (bucketInfo) {
            console.log('✅ Bucket encontrado:', {
              nome: bucketInfo.name,
              público: bucketInfo.public,
              criado: bucketInfo.created_at
            });
          } else {
            console.warn('⚠️ Bucket "banners" não encontrado na lista');
          }
        } else if (listError) {
          console.warn('⚠️ Não foi possível listar buckets (tentando upload direto):', listError.message);
          // Se não conseguir listar, vamos tentar fazer upload mesmo assim
        }
      } catch (checkError) {
        console.warn('⚠️ Erro ao verificar buckets, tentando upload direto:', checkError);
        // Continua tentando fazer upload mesmo se a verificação falhar
      }

      // Se não encontrou o bucket, tenta mesmo assim (pode ser problema de permissão na listagem)
      if (!bucketExists) {
        console.log('⚠️ Bucket não encontrado na verificação, mas tentando upload direto...');
      }

      console.log('📤 Iniciando upload do arquivo:', fileName);
      
      // Fazer upload
      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      console.log('📥 Resposta do upload:', { error: uploadError, data });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Melhorar mensagem de erro com mais detalhes
        const errorMsg = uploadError.message || String(uploadError);
        
        if (errorMsg.includes('Bucket not found') || 
            errorMsg.includes('not found') ||
            errorMsg.includes('does not exist') ||
            errorMsg.includes('404')) {
          
          const bucketStatusMsg = bucketExists 
            ? 'Bucket existe mas pode haver problema de configuração.'
            : 'Bucket não foi encontrado na verificação inicial.';
          
          throw new Error(
            `❌ Bucket "banners" não encontrado ou inacessível.\n\n` +
            `${bucketStatusMsg}\n\n` +
            `🔧 Verifique:\n` +
            `1. ✅ O bucket foi criado no Supabase Dashboard → Storage\n` +
            `2. ✅ Nome está correto: "banners" (exatamente assim, minúsculas)\n` +
            `3. ✅ Bucket está marcado como "Public bucket" (PÚBLICO)\n` +
            `4. ✅ Você está logado como admin\n` +
            `5. ✅ Execute o SQL RECRIAR_POLITICAS_BANNER.sql\n\n` +
            `💡 Depois de verificar, recarregue a página (F5) e tente novamente.`
          );
        }
        
        if (errorMsg.includes('new row violates row-level security') || 
            errorMsg.includes('row-level security') ||
            errorMsg.includes('RLS') ||
            errorMsg.includes('permission denied') ||
            errorMsg.includes('insufficient_privilege')) {
          throw new Error(
            '⚠️ Política RLS bloqueou o upload.\n\n' +
            'Execute o SQL CREATE_BANNER_STORAGE_BUCKET.sql no Supabase SQL Editor.\n\n' +
            'Também verifique:\n' +
            '1. Você está logado como admin?\n' +
            '2. O bucket está marcado como Público?\n' +
            '3. As políticas RLS foram criadas corretamente?'
          );
        }
        
        if (errorMsg.includes('Duplicate') || errorMsg.includes('already exists')) {
          // Tentar fazer upload com nome diferente
          const retryFileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: retryError, data: retryData } = await supabase.storage
            .from('banners')
            .upload(retryFileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (retryError) {
            throw new Error(`Erro no upload: ${retryError.message}`);
          }
          
          const { data: retryUrlData } = supabase.storage
            .from('banners')
            .getPublicUrl(retryFileName);
          
          return retryUrlData.publicUrl;
        }
        
        // Erro genérico com mensagem completa
        throw new Error(
          `Erro no upload: ${errorMsg}\n\n` +
          `Verifique:\n` +
          `1. Bucket "banners" existe e está público\n` +
          `2. Políticas RLS foram executadas\n` +
          `3. Você está logado como admin\n` +
          `4. Console do navegador (F12) para mais detalhes`
        );
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const saveBannerSettings = async () => {
    setSavingBanner(true);
    try {
      let imageUrl = bannerSettings.banner_image_url;

      // Se há arquivo para upload, fazer upload primeiro
      if (bannerImageFile) {
        setUploadingBanner(true);
        try {
          imageUrl = await uploadBannerImage(bannerImageFile) || '';
          if (!imageUrl) {
            throw new Error('Falha ao fazer upload da imagem');
          }
          toast({ title: 'Upload concluído!', description: 'Imagem carregada com sucesso' });
        } catch (uploadError: any) {
          toast({ 
            title: 'Erro no upload', 
            description: uploadError.message || 'Não foi possível fazer upload da imagem. Tente novamente ou use uma URL.',
            variant: 'destructive' 
          });
          setUploadingBanner(false);
          setSavingBanner(false);
          return;
        } finally {
          setUploadingBanner(false);
        }
      }

      const updates = [
        { key: 'banner_image_url', value: imageUrl },
        { key: 'banner_text', value: bannerSettings.banner_text },
        { key: 'banner_redirect_url', value: bannerSettings.banner_redirect_url }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      toast({ title: 'Sucesso!', description: 'Configurações do banner salvas' });
      
      // Limpar preview e arquivo após salvar
      setBannerImageFile(null);
      setBannerImagePreview(null);
      setBannerSettings({ ...bannerSettings, banner_image_url: imageUrl });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSavingBanner(false);
    }
  };
  
  const saveCustomSettings = async () => {
    setSavingCustom(true);
    try {
      console.log('💾 Salvando personalizações:', customSettings);
      
      const updates = [
        { key: 'platform_name', value: customSettings.platform_name || '' },
        { key: 'logo_url', value: customSettings.logo_url || '' },
        { key: 'primary_color', value: customSettings.primary_color || '#8b5cf6' },
        { key: 'theme', value: customSettings.theme || 'dark' },
        { key: 'header_title', value: customSettings.header_title || 'Area De Mentorados' }
      ];
      
      console.log('📤 Atualizações a fazer:', updates);
      
      for (const update of updates) {
        console.log(`Atualizando ${update.key} = ${update.value}`);
        const { data, error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) {
          console.error(`Erro ao salvar ${update.key}:`, error);
          throw new Error(`Erro ao salvar ${update.key}: ${error.message}`);
        }
        console.log(`✅ ${update.key} salvo com sucesso`);
      }
      
      toast({ 
        title: 'Sucesso!', 
        description: 'Personalizações salvas com sucesso. Aplicando mudanças...' 
      });
      
      // Recarregar a página para aplicar todas as mudanças (cor e tema)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Erro ao salvar personalizações:', error);
      const errorMessage = error.message || 'Erro desconhecido ao salvar personalizações';
      
      // Verificar se é erro de tabela não existente
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('table')) {
        toast({ 
          title: 'Erro', 
          description: 'Tabela site_settings não encontrada. Execute o SQL EXECUTAR_MIGRACAO_SETTINGS.sql no Supabase.', 
          variant: 'destructive' 
        });
      } else if (errorMessage.includes('permission') || errorMessage.includes('RLS') || errorMessage.includes('row-level')) {
        toast({ 
          title: 'Erro de Permissão', 
          description: 'Você não tem permissão para salvar. Verifique se você é admin e se as políticas RLS estão configuradas.', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Erro', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      }
    } finally {
      setSavingCustom(false);
    }
  };
  
  const saveGeneralSettings = async () => {
    setSavingGeneral(true);
    try {
      const updates = [
        { key: 'support_email', value: generalSettings.support_email },
        { key: 'terms_url', value: generalSettings.terms_url },
        { key: 'privacy_url', value: generalSettings.privacy_url }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      toast({ title: 'Sucesso!', description: 'Configurações gerais salvas' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveLayoutSettings = async () => {
    setSavingLayout(true);
    try {
      const updates = [
        { key: 'modules_layout_type', value: layoutSettings.modules_layout_type },
        { key: 'modules_section_title', value: layoutSettings.modules_section_title },
        { key: 'show_continue_watching', value: layoutSettings.show_continue_watching ? 'true' : 'false' },
        { key: 'continue_watching_title', value: layoutSettings.continue_watching_title },
        { key: 'show_accelerator', value: layoutSettings.show_accelerator ? 'true' : 'false' },
        { key: 'accelerator_title', value: layoutSettings.accelerator_title },
        { key: 'modules_grid_columns', value: layoutSettings.modules_grid_columns }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      toast({ title: 'Sucesso!', description: 'Configurações de layout salvas. Recarregue a página para ver as mudanças.' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSavingLayout(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.title.trim()) {
      toast({ title: 'Erro', description: 'O título do curso é obrigatório', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('courses').insert({ 
      title: newCourse.title.trim(), 
      description: newCourse.description.trim() || null,
      image_url: newCourse.image_url.trim() || null,
      is_locked: newCourse.is_locked || false,
      offer_video_url: newCourse.offer_video_url?.trim() || null,
      purchase_url: newCourse.purchase_url?.trim() || null,
      order: courses.length + 1 
    });
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Curso criado com sucesso' });
    setNewCourse({ title: '', description: '', image_url: '', is_locked: false, offer_video_url: '', purchase_url: '' });
    fetchData();
  };

  const startEditCourse = (course: Course) => {
    setEditingCourse(course.id);
    setEditCourseData({ 
      title: course.title, 
      description: course.description || '', 
      image_url: course.image_url || '',
      is_locked: course.is_locked || false,
      offer_video_url: course.offer_video_url || '',
      purchase_url: course.purchase_url || ''
    });
  };

  const cancelEditCourse = () => {
    setEditingCourse(null);
    setEditCourseData({ title: '', description: '', image_url: '', is_locked: false, offer_video_url: '', purchase_url: '' });
  };

  const saveEditCourse = async (id: string) => {
    if (!editCourseData.title.trim()) {
      toast({ title: 'Erro', description: 'O título do curso é obrigatório', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('courses')
      .update({ 
        title: editCourseData.title.trim(), 
        description: editCourseData.description.trim() || null,
        image_url: editCourseData.image_url.trim() || null,
        is_locked: editCourseData.is_locked || false,
        offer_video_url: editCourseData.offer_video_url?.trim() || null,
        purchase_url: editCourseData.purchase_url?.trim() || null
      })
      .eq('id', id);
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Curso atualizado' });
    setEditingCourse(null);
    setEditCourseData({ title: '', description: '', image_url: '', is_locked: false, offer_video_url: '', purchase_url: '' });
    fetchData();
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Curso excluído' });
    if (selectedCourse === id) {
      setSelectedCourse(null);
    }
    setDeleteCourseId(null);
    fetchData();
  };

  const addModule = async () => {
    if (!newModule.title.trim()) {
      toast({ title: 'Erro', description: 'O título do módulo é obrigatório', variant: 'destructive' });
      return;
    }
    if (!newModule.course_id) {
      toast({ title: 'Erro', description: 'Selecione um curso', variant: 'destructive' });
      return;
    }

    let imageUrl = newModule.image_url;

    // Se há arquivo para upload, fazer upload primeiro
    if (moduleImageFile) {
      setUploadingModuleImage(true);
      try {
        imageUrl = await uploadModuleImage(moduleImageFile) || '';
        if (!imageUrl) {
          throw new Error('Falha ao fazer upload da imagem');
        }
        toast({ title: 'Upload concluído!', description: 'Imagem carregada com sucesso' });
      } catch (uploadError: any) {
        toast({ 
          title: 'Erro no upload', 
          description: uploadError.message || 'Não foi possível fazer upload da imagem. Tente novamente ou use uma URL.',
          variant: 'destructive' 
        });
        setUploadingModuleImage(false);
        return;
      } finally {
        setUploadingModuleImage(false);
      }
    }

    const courseModules = modules.filter(m => m.course_id === newModule.course_id);
    const { error } = await supabase.from('courses_modules').insert({ 
      title: newModule.title.trim(), 
      description: newModule.description.trim() || null,
      course_id: newModule.course_id,
      image_url: imageUrl || null,
      order: courseModules.length + 1 
    });
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Módulo criado com sucesso' });
    setNewModule({ title: '', description: '', course_id: '', image_url: '' });
    setModuleImageFile(null);
    setModuleImagePreview(null);
    fetchData();
  };

  const startEditModule = (module: Module) => {
    setEditingModule(module.id);
    setEditModuleData({ 
      title: module.title, 
      description: module.description || '', 
      course_id: module.course_id || '',
      image_url: module.image_url || ''
    });
    setEditingModuleImageFile(null);
    setEditingModuleImagePreview(module.image_url || null);
  };

  const cancelEditModule = () => {
    setEditingModule(null);
    setEditModuleData({ title: '', description: '', course_id: '', image_url: '' });
    setEditingModuleImageFile(null);
    setEditingModuleImagePreview(null);
  };

  const saveEditModule = async (id: string) => {
    if (!editModuleData.title.trim()) {
      toast({ title: 'Erro', description: 'O título do módulo é obrigatório', variant: 'destructive' });
      return;
    }

    let imageUrl = editModuleData.image_url;

    // Se há arquivo novo para upload, fazer upload primeiro
    if (editingModuleImageFile) {
      setUploadingModuleImage(true);
      try {
        imageUrl = await uploadModuleImage(editingModuleImageFile) || '';
        if (!imageUrl) {
          throw new Error('Falha ao fazer upload da imagem');
        }
      } catch (uploadError: any) {
        toast({ 
          title: 'Erro no upload', 
          description: uploadError.message || 'Não foi possível fazer upload da imagem',
          variant: 'destructive' 
        });
        setUploadingModuleImage(false);
        return;
      } finally {
        setUploadingModuleImage(false);
      }
    }

    const { error } = await supabase
      .from('courses_modules')
      .update({ 
        title: editModuleData.title.trim(), 
        description: editModuleData.description.trim() || null,
        course_id: editModuleData.course_id || null,
        image_url: imageUrl || null
      })
      .eq('id', id);
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Módulo atualizado' });
    setEditingModule(null);
    setEditModuleData({ title: '', description: '', course_id: '', image_url: '' });
    setEditingModuleImageFile(null);
    setEditingModuleImagePreview(null);
    fetchData();
  };

  const deleteModule = async (id: string) => {
    const { error } = await supabase.from('courses_modules').delete().eq('id', id);
    if (error) { 
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }); 
      return; 
    }
    toast({ title: 'Sucesso!', description: 'Módulo excluído' });
    if (selectedModule === id) {
      setSelectedModule(null);
    }
    setDeleteModuleId(null);
    fetchData();
  };

  const addLesson = async () => {
    if (!newLesson.title || !selectedModule) return;
    const moduleLessons = lessons.filter(l => l.module_id === selectedModule);
    const { error } = await supabase.from('courses_lessons').insert({ 
      module_id: selectedModule, title: newLesson.title, description_html: newLesson.description_html, 
      video_vturb_url: newLesson.video_vturb_url, is_premium: newLesson.is_premium, order: moduleLessons.length + 1 
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Aula criada!' });
    setNewLesson({ title: '', description_html: '', video_vturb_url: '', is_premium: false });
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('courses_lessons').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Aula excluída' });
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Carregando...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg">Painel Administrativo</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Gerencie cursos, módulos e configurações</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveTab('courses');
                setTimeout(() => {
                  document.getElementById('course-title')?.focus();
                }, 100);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Curso</span>
              <span className="sm:hidden">Curso</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (!courses.length) {
                  toast({
                    title: 'Crie um curso primeiro',
                    description: 'Você precisa criar pelo menos um curso antes de adicionar módulos',
                    variant: 'destructive'
                  });
                  setActiveTab('courses');
                  return;
                }
                setActiveTab('modules');
                setTimeout(() => {
                  document.getElementById('module-course')?.focus();
                }, 100);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Módulo</span>
              <span className="sm:hidden">Módulo</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (!selectedModule) {
                  toast({
                    title: 'Selecione um módulo',
                    description: 'Selecione um módulo primeiro na aba "Módulos" para adicionar aulas',
                    variant: 'destructive'
                  });
                  setActiveTab('modules');
                  return;
                }
                setActiveTab('lessons');
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Aula</span>
              <span className="sm:hidden">Aula</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-9 gap-2 h-auto p-1.5">
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Módulos</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Aulas</span>
            </TabsTrigger>
            <TabsTrigger value="banner" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Banner</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="customize" className="gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Personalizar</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Cursos */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Gerenciar Cursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário Adicionar Curso */}
                <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Plus className="w-4 h-4" />
                    Novo Curso
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="course-title" className="text-sm font-medium mb-1.5 block">
                        Título do Curso <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="course-title"
                        placeholder="Ex: Marketing Digital Completo"
                        value={newCourse.title}
                        onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-description" className="text-sm font-medium mb-1.5 block">
                        Descrição
                      </Label>
                      <Textarea
                        id="course-description"
                        placeholder="Descreva o que os alunos vão aprender neste curso..."
                        value={newCourse.description}
                        onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-image" className="text-sm font-medium mb-1.5 block">
                        URL da Imagem (Opcional)
                      </Label>
                      <Input
                        id="course-image"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={newCourse.image_url}
                        onChange={e => setNewCourse(p => ({ ...p, image_url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">Oferta de Vendas (apenas para cursos bloqueados)</Label>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Código Embed do Vídeo
                        </Label>
                        <Textarea
                          placeholder='Cole o código embed completo aqui, ex: <iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                          value={newCourse.offer_video_url || ''}
                          onChange={e => setNewCourse(p => ({ ...p, offer_video_url: e.target.value }))}
                          rows={4}
                          className="font-mono text-xs"
                        />
                      </div>
                      <Input
                        placeholder="URL de Compra (link do checkout)"
                        value={newCourse.purchase_url || ''}
                        onChange={e => setNewCourse(p => ({ ...p, purchase_url: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={addCourse}
                      className="w-full gap-2"
                      disabled={!newCourse.title.trim()}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Curso
                    </Button>
                  </div>
                </div>

                {/* Lista de Cursos */}
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    Cursos existentes ({courses.length})
                  </div>
                  {courses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                      <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-1">Nenhum curso criado ainda</p>
                      <p className="text-xs">Adicione seu primeiro curso usando o formulário acima</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courses.map(course => {
                        const courseModules = modules.filter(m => m.course_id === course.id);
                        const courseLessons = lessons.filter(l => 
                          courseModules.some(m => m.id === l.module_id)
                        );
                        
                        return (
                          <div
                            key={course.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedCourse === course.id
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'hover:bg-secondary/50 border-border'
                            }`}
                            onClick={() => editingCourse !== course.id && setSelectedCourse(course.id)}
                          >
                            {editingCourse === course.id ? (
                              <div className="space-y-3">
                                <Input
                                  placeholder="Título do curso"
                                  value={editCourseData.title}
                                  onChange={e => setEditCourseData({ ...editCourseData, title: e.target.value })}
                                  onClick={e => e.stopPropagation()}
                                />
                                <Textarea
                                  placeholder="Descrição"
                                  value={editCourseData.description}
                                  onChange={e => setEditCourseData({ ...editCourseData, description: e.target.value })}
                                  onClick={e => e.stopPropagation()}
                                  rows={2}
                                />
                                <Input
                                  placeholder="URL da Imagem"
                                  value={editCourseData.image_url}
                                  onChange={e => setEditCourseData({ ...editCourseData, image_url: e.target.value })}
                                  onClick={e => e.stopPropagation()}
                                />
                                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                  <Label className="text-sm font-medium">Curso Bloqueado</Label>
                                  <Switch
                                    checked={editCourseData.is_locked || false}
                                    onCheckedChange={(checked) => setEditCourseData({ ...editCourseData, is_locked: checked })}
                                  />
                                </div>
                                <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/30">
                                  <Label className="text-sm font-medium">Oferta de Vendas (apenas para cursos bloqueados)</Label>
                                  <div>
                                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                                      Código Embed do Vídeo
                                    </Label>
                                    <Textarea
                                      placeholder='Cole o código embed completo aqui, ex: <iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                                      value={editCourseData.offer_video_url || ''}
                                      onChange={e => setEditCourseData({ ...editCourseData, offer_video_url: e.target.value })}
                                      onClick={e => e.stopPropagation()}
                                      rows={4}
                                      className="font-mono text-xs"
                                    />
                                  </div>
                                  <Input
                                    placeholder="URL de Compra (link do checkout)"
                                    value={editCourseData.purchase_url || ''}
                                    onChange={e => setEditCourseData({ ...editCourseData, purchase_url: e.target.value })}
                                    onClick={e => e.stopPropagation()}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Quando o aluno tentar acessar este curso bloqueado, verá uma oferta com o vídeo e o botão de compra.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); saveEditCourse(course.id); }}
                                    className="flex-1"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={e => { e.stopPropagation(); cancelEditCourse(); }}
                                    className="flex-1"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-base">{course.title}</div>
                                    {course.is_locked && (
                                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded border border-orange-500/30">
                                        🔒 Bloqueado
                                      </span>
                                    )}
                                  </div>
                                  {course.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {courseModules.length} módulo{courseModules.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {courseLessons.length} aula{courseLessons.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg">
                                    <Label htmlFor={`lock-${course.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                      Bloquear
                                    </Label>
                                    <Switch
                                      id={`lock-${course.id}`}
                                      checked={course.is_locked || false}
                                      onCheckedChange={async (checked) => {
                                        const { error } = await (supabase as any)
                                          .from('courses')
                                          .update({ is_locked: checked })
                                          .eq('id', course.id);
                                        if (error) {
                                          toast({ 
                                            title: 'Erro', 
                                            description: error.message, 
                                            variant: 'destructive' 
                                          });
                                        } else {
                                          toast({ 
                                            title: 'Sucesso', 
                                            description: checked ? 'Curso bloqueado' : 'Curso desbloqueado' 
                                          });
                                          fetchData();
                                        }
                                      }}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditCourse(course)}
                                    className="h-8 w-8"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteCourseId(course.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Módulos */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Gerenciar Módulos
                </CardTitle>
              </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Module Form */}
            <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Plus className="w-4 h-4" />
                Novo Módulo
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="module-course" className="text-sm font-medium mb-1.5 block">
                    Curso <span className="text-destructive">*</span>
                  </Label>
                  {courses.length === 0 ? (
                    <div className="p-3 border border-dashed border-border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground text-center">
                        Crie um curso primeiro na aba "Cursos"
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={newModule.course_id}
                      onValueChange={value => setNewModule(p => ({ ...p, course_id: value }))}
                    >
                      <SelectTrigger id="module-course">
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="module-title" className="text-sm font-medium mb-1.5 block">
                    Título do Módulo <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="module-title"
                    placeholder="Ex: Introdução ao Marketing Digital" 
                    value={newModule.title} 
                    onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addModule();
                      }
                    }}
                  />
            </div>
                    <div>
                      <Label htmlFor="module-description" className="text-sm font-medium mb-1.5 block">
                        Descrição
                      </Label>
                      <Textarea 
                        id="module-description"
                        placeholder="Descreva o que os alunos vão aprender neste módulo..." 
                        value={newModule.description} 
                        onChange={e => setNewModule(p => ({ ...p, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Capa do Módulo (Opcional)
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleModuleImageChange(e, false)}
                              className="hidden"
                              id="module-image-upload"
                              disabled={uploadingModuleImage}
                            />
                            <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">
                                {moduleImageFile ? 'Trocar Imagem' : 'Escolher Capa'}
                              </span>
                            </div>
                          </label>
                          
                          {(moduleImageFile || moduleImagePreview || newModule.image_url) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModuleImage(false)}
                              disabled={uploadingModuleImage}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          )}
                        </div>

                        {moduleImagePreview && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                            <img
                              src={moduleImagePreview}
                              alt="Preview da capa"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {!moduleImagePreview && newModule.image_url && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                            <img
                              src={newModule.image_url}
                              alt="Capa atual"
                              className="w-full h-full object-cover"
                              onError={() => {
                                setNewModule({ ...newModule, image_url: '' });
                              }}
                            />
                          </div>
                        )}

                        <Input 
                          placeholder="Ou cole a URL da imagem" 
                          value={newModule.image_url}
                          onChange={e => setNewModule(p => ({ ...p, image_url: e.target.value }))}
                          disabled={!!moduleImageFile || uploadingModuleImage}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Envie uma imagem (máx 5MB) ou cole uma URL. Esta será a capa do módulo.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={addModule} 
                      className="w-full gap-2"
                      disabled={!newModule.title.trim() || !newModule.course_id || uploadingModuleImage}
                    >
                      {uploadingModuleImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Fazendo upload...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Adicionar Módulo
                        </>
                      )}
                    </Button>
              </div>
            </div>
            
            {/* Modules List */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Módulos existentes ({modules.length})
              </div>
              {modules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">Nenhum módulo criado ainda</p>
                  <p className="text-xs">Adicione seu primeiro módulo usando o formulário acima</p>
                </div>
              ) : (
                <div className="space-y-2">
                {modules.map(m => {
                  const course = courses.find(c => c.id === m.course_id);
                  return (
                  <div 
                    key={m.id} 
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedModule === m.id 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'hover:bg-secondary/50 border-border'
                    }`}
                    onClick={() => editingModule !== m.id && setSelectedModule(m.id)}
                  >
                    {editingModule === m.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Curso</Label>
                          <Select
                            value={editModuleData.course_id}
                            onValueChange={value => setEditModuleData({ ...editModuleData, course_id: value })}
                          >
                            <SelectTrigger onClick={e => e.stopPropagation()}>
                              <SelectValue placeholder="Selecione um curso" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          placeholder="Título do módulo"
                          value={editModuleData.title}
                          onChange={e => setEditModuleData({ ...editModuleData, title: e.target.value })}
                          onClick={e => e.stopPropagation()}
                        />
                        <Textarea
                          placeholder="Descrição"
                          value={editModuleData.description}
                          onChange={e => setEditModuleData({ ...editModuleData, description: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          rows={2}
                        />
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Capa do Módulo</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleModuleImageChange(e, true)}
                                  className="hidden"
                                  onClick={e => e.stopPropagation()}
                                  disabled={uploadingModuleImage}
                                />
                                <div className="flex items-center gap-1 px-3 py-1.5 border border-border rounded text-xs hover:bg-secondary/50 transition-colors">
                                  <Upload className="w-3 h-3" />
                                  {editingModuleImageFile ? 'Trocar' : 'Upload'}
                                </div>
                              </label>
                              {(editingModuleImageFile || editingModuleImagePreview || editModuleData.image_url) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); removeModuleImage(true); }}
                                  disabled={uploadingModuleImage}
                                  className="h-7 text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Remover
                                </Button>
                              )}
                            </div>
                            {(editingModuleImagePreview || editModuleData.image_url) && (
                              <div className="relative w-full h-24 rounded overflow-hidden border border-border">
                                <img
                                  src={editingModuleImagePreview || editModuleData.image_url || ''}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                            )}
                            <Input
                              placeholder="Ou cole URL da imagem"
                              value={editModuleData.image_url}
                              onChange={e => setEditModuleData({ ...editModuleData, image_url: e.target.value })}
                              onClick={e => e.stopPropagation()}
                              disabled={!!editingModuleImageFile || uploadingModuleImage}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={e => { e.stopPropagation(); saveEditModule(m.id); }}
                            className="flex-1"
                            disabled={uploadingModuleImage}
                          >
                            {uploadingModuleImage ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Check className="w-4 h-4 mr-1" />
                            )}
                            {uploadingModuleImage ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={e => { e.stopPropagation(); cancelEditModule(); }}
                            className="flex-1"
                            disabled={uploadingModuleImage}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0 flex gap-3">
                          {m.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={m.image_url}
                                alt={m.title}
                                className="w-16 h-16 rounded object-cover border border-border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-base">{m.title}</div>
                              {course && (
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                  {course.title}
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {lessons.filter(l => l.module_id === m.id).length} aula(s)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditModule(m)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteModuleId(m.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
                </div>
              )}
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Aulas */}
          <TabsContent value="lessons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Gerenciar Aulas
                  {selectedModule && (
                    <span className="text-sm font-normal text-muted-foreground">
                      - {modules.find(m => m.id === selectedModule)?.title}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedModule ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Selecione um módulo na aba "Módulos" para adicionar aulas</p>
                    <Button variant="outline" onClick={() => setActiveTab('modules')}>
                      Ir para Módulos
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <Label>Módulo Selecionado</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <span className="font-medium">{modules.find(m => m.id === selectedModule)?.title}</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="lesson-title">Título da Aula <span className="text-destructive">*</span></Label>
                        <Input 
                          id="lesson-title"
                          placeholder="Ex: Introdução ao Marketing Digital" 
                          value={newLesson.title} 
                          onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="lesson-video">Código Embed do Vídeo</Label>
                        <Textarea 
                          id="lesson-video"
                          placeholder='Cole aqui o código embed completo do iframe, por exemplo: &lt;iframe src="https://..."&gt;&lt;/iframe&gt;' 
                          value={newLesson.video_vturb_url} 
                          onChange={e => setNewLesson(p => ({ ...p, video_vturb_url: e.target.value }))}
                          rows={4}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Cole o código HTML completo do iframe fornecido pela plataforma de vídeo
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="lesson-description">Descrição HTML</Label>
                        <Textarea 
                          id="lesson-description"
                          placeholder="Descrição da aula (suporta HTML e links)" 
                          value={newLesson.description_html} 
                          onChange={e => setNewLesson(p => ({ ...p, description_html: e.target.value }))} 
                          rows={4} 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={newLesson.is_premium} 
                          onCheckedChange={c => setNewLesson(p => ({ ...p, is_premium: c }))} 
                        />
                        <Label>Conteúdo Premium</Label>
                      </div>
                      <Button 
                        onClick={addLesson} 
                        className="w-full gap-2"
                        disabled={!newLesson.title.trim()}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Aula
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground mb-3">
                        Aulas deste módulo ({lessons.filter(l => l.module_id === selectedModule).length})
                      </div>
                      {lessons.filter(l => l.module_id === selectedModule).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma aula neste módulo</p>
                        </div>
                      ) : (
                        lessons.filter(l => l.module_id === selectedModule).map(l => (
                          <div key={l.id} className="p-3 rounded-lg border flex justify-between items-center hover:bg-secondary/50 transition-colors">
                            <div>
                              <span className="font-medium">{l.title}</span>
                              {l.is_premium && <span className="text-xs text-premium ml-2 px-2 py-0.5 bg-premium/10 rounded">Premium</span>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteLesson(l.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Banner */}
          <TabsContent value="banner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Gerenciar Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Imagem do Banner</Label>
                    
                    {/* Upload de Arquivo */}
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            className="hidden"
                            id="banner-upload"
                            disabled={uploadingBanner || savingBanner}
                          />
                          <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">
                              {bannerImageFile ? 'Trocar Imagem' : 'Escolher Arquivo'}
                            </span>
                          </div>
                        </label>
                        
                        {(bannerImageFile || bannerImagePreview || bannerSettings.banner_image_url) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeBannerImage}
                            disabled={uploadingBanner || savingBanner}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>

                      {/* Preview da Imagem */}
                      {bannerImagePreview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                          <img
                            src={bannerImagePreview}
                            alt="Preview do banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Mostrar imagem atual se não houver preview */}
                      {!bannerImagePreview && bannerSettings.banner_image_url && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                          <img
                            src={bannerSettings.banner_image_url}
                            alt="Banner atual"
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Se a imagem não carregar, pode ser que seja inválida
                              setBannerSettings({ ...bannerSettings, banner_image_url: '' });
                            }}
                          />
                        </div>
                      )}

                      {/* Ou usar URL */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">ou</span>
                        </div>
                      </div>
                      
                      <Input 
                        placeholder="Ou cole a URL da imagem" 
                        value={bannerSettings.banner_image_url}
                        onChange={e => setBannerSettings({ ...bannerSettings, banner_image_url: e.target.value })}
                        disabled={!!bannerImageFile || uploadingBanner || savingBanner}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      Envie uma imagem (máx 5MB) ou cole uma URL. Formatos: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                  <div>
                    <Label>Texto do Banner (Opcional)</Label>
                    <Input 
                      placeholder="método sociedade" 
                      value={bannerSettings.banner_text}
                      onChange={e => setBannerSettings({ ...bannerSettings, banner_text: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>URL de Redirecionamento (Opcional)</Label>
                    <Input 
                      placeholder="https://..." 
                      value={bannerSettings.banner_redirect_url}
                      onChange={e => setBannerSettings({ ...bannerSettings, banner_redirect_url: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Para onde o usuário será redirecionado ao clicar no banner
                    </p>
                  </div>
                  <Button 
                    onClick={saveBannerSettings}
                    disabled={savingBanner || uploadingBanner || (!bannerImageFile && !bannerSettings.banner_image_url)}
                    className="w-full gap-2"
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fazendo upload da imagem...
                      </>
                    ) : savingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Salvar Banner
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Personalizar */}
          <TabsContent value="customize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Personalizar Área de Membros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nome da Plataforma</Label>
                    <Input 
                      placeholder="método sociedade" 
                      value={customSettings.platform_name}
                      onChange={e => setCustomSettings({ ...customSettings, platform_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Título do Header</Label>
                    <Input 
                      placeholder="Area De Mentorados" 
                      value={customSettings.header_title}
                      onChange={e => setCustomSettings({ ...customSettings, header_title: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Texto que aparece no banner do header na área de membros
                    </p>
                  </div>
                  <div>
                    <Label>Logo URL (Opcional)</Label>
                    <Input 
                      placeholder="https://exemplo.com/logo.png" 
                      value={customSettings.logo_url}
                      onChange={e => setCustomSettings({ ...customSettings, logo_url: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cor Primária</Label>
                    <Input 
                      type="color" 
                      value={customSettings.primary_color}
                      onChange={e => setCustomSettings({ ...customSettings, primary_color: e.target.value })}
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label>Cor do Tema</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="theme-dark" 
                          name="theme" 
                          checked={customSettings.theme === 'dark'}
                          onChange={() => setCustomSettings({ ...customSettings, theme: 'dark' })}
                          className="w-4 h-4" 
                        />
                        <Label htmlFor="theme-dark">Escuro (Dark)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="theme-light" 
                          name="theme" 
                          checked={customSettings.theme === 'light'}
                          onChange={() => setCustomSettings({ ...customSettings, theme: 'light' })}
                          className="w-4 h-4" 
                        />
                        <Label htmlFor="theme-light">Claro (Light)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id="theme-system" 
                          name="theme" 
                          checked={customSettings.theme === 'system'}
                          onChange={() => setCustomSettings({ ...customSettings, theme: 'system' })}
                          className="w-4 h-4" 
                        />
                        <Label htmlFor="theme-system">Automático (Sistema)</Label>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={saveCustomSettings}
                    disabled={savingCustom}
                    className="w-full gap-2"
                  >
                    {savingCustom ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        Salvar Personalizações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Layout da Área de Membros</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Personalize como o conteúdo é exibido na área de membros
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo de Layout dos Módulos */}
                <div>
                  <Label className="text-base font-semibold">Tipo de Layout dos Módulos</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Escolha como os módulos serão exibidos na página principal
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLayoutSettings({ ...layoutSettings, modules_layout_type: 'horizontal-scroll' })}>
                      <input 
                        type="radio" 
                        id="layout-horizontal" 
                        name="modules_layout_type" 
                        checked={layoutSettings.modules_layout_type === 'horizontal-scroll'}
                        onChange={() => {}}
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="layout-horizontal" className="flex-1 cursor-pointer">
                        <div className="font-medium">Scroll Horizontal</div>
                        <div className="text-sm text-muted-foreground">Cards em linha com scroll horizontal (padrão)</div>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLayoutSettings({ ...layoutSettings, modules_layout_type: 'grid' })}>
                      <input 
                        type="radio" 
                        id="layout-grid" 
                        name="modules_layout_type" 
                        checked={layoutSettings.modules_layout_type === 'grid'}
                        onChange={() => {}}
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="layout-grid" className="flex-1 cursor-pointer">
                        <div className="font-medium">Grade (Grid)</div>
                        <div className="text-sm text-muted-foreground">Cards organizados em grade responsiva</div>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLayoutSettings({ ...layoutSettings, modules_layout_type: 'list' })}>
                      <input 
                        type="radio" 
                        id="layout-list" 
                        name="modules_layout_type" 
                        checked={layoutSettings.modules_layout_type === 'list'}
                        onChange={() => {}}
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="layout-list" className="flex-1 cursor-pointer">
                        <div className="font-medium">Lista</div>
                        <div className="text-sm text-muted-foreground">Cards em formato de lista vertical</div>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Colunas do Grid */}
                {layoutSettings.modules_layout_type === 'grid' && (
                  <div>
                    <Label>Colunas da Grade</Label>
                    <Select 
                      value={layoutSettings.modules_grid_columns} 
                      onValueChange={(value) => setLayoutSettings({ ...layoutSettings, modules_grid_columns: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Colunas</SelectItem>
                        <SelectItem value="3">3 Colunas (recomendado)</SelectItem>
                        <SelectItem value="4">4 Colunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Título da Seção de Módulos */}
                <div>
                  <Label>Título da Seção de Módulos</Label>
                  <Input 
                    placeholder="Ex: Método Sociedade" 
                    value={layoutSettings.modules_section_title}
                    onChange={e => setLayoutSettings({ ...layoutSettings, modules_section_title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Seções da Página</h3>
                  
                  {/* Seção Continue Assistindo */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base">Mostrar Seção "Continue Assistindo"</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibe as aulas que o usuário está assistindo
                      </p>
                    </div>
                    <Switch
                      checked={layoutSettings.show_continue_watching}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_continue_watching: checked })}
                    />
                  </div>

                  {layoutSettings.show_continue_watching && (
                    <div>
                      <Label>Título da Seção "Continue Assistindo"</Label>
                      <Input 
                        placeholder="Ex: Continue assistindo" 
                        value={layoutSettings.continue_watching_title}
                        onChange={e => setLayoutSettings({ ...layoutSettings, continue_watching_title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Seção Acelerador */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base">Mostrar Seção "Acelerador de Resultados"</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibe seção adicional (pode ser customizada depois)
                      </p>
                    </div>
                    <Switch
                      checked={layoutSettings.show_accelerator}
                      onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_accelerator: checked })}
                    />
                  </div>

                  {layoutSettings.show_accelerator && (
                    <div>
                      <Label>Título da Seção "Acelerador de Resultados"</Label>
                      <Input 
                        placeholder="Ex: Acelerador de Resultados" 
                        value={layoutSettings.accelerator_title}
                        onChange={e => setLayoutSettings({ ...layoutSettings, accelerator_title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Botão Salvar */}
                <Button 
                  onClick={saveLayoutSettings} 
                  disabled={savingLayout}
                  className="w-full"
                  size="lg"
                >
                  {savingLayout ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações de Layout
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Usuários */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Usuários
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={users.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">
                      {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </p>
                    {!searchQuery && (
                      <p className="text-xs mt-1">Os usuários aparecerão aqui quando fizerem login</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((userItem) => {
                      const userId = userItem.user_id || userItem.id;
                      const isExpanded = expandedUserId === userId;
                      const lockedCoursesForUser = courses.filter(c => c.is_locked);
                      const userAccesses = userCourseAccessList[userId] || [];

                      return (
                        <div key={userId} className="border border-border rounded-lg overflow-hidden">
                          {/* Card do Usuário */}
                          <div 
                            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedUserId(isExpanded ? null : userId)}
                          >
                            {/* Avatar */}
                            <Avatar className="w-12 h-12 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {getInitials(userItem.full_name)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info do Usuário */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-base">
                                  {userItem.full_name || 'Usuário sem nome'}
                                </p>
                                {userItem.is_admin && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-500 rounded border border-orange-500/30">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {userItem.email && (
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{userItem.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status e Badges */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  userItem.premium_active 
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                                }`}>
                                  {userItem.premium_active ? 'Premium' : 'Free'}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">
                                  User
                                </span>
                              </div>

                              {/* Menu de Opções */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUserId(userId);
                                      setExpandedUserId(userId);
                                    }}
                                  >
                                    Gerenciar Acesso
                                  </DropdownMenuItem>
                                  {userItem.email && (
                                    <DropdownMenuItem onClick={() => {
                                      navigator.clipboard.writeText(userItem.email);
                                      toast({ title: 'Email copiado!' });
                                    }}>
                                      Copiar Email
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Painel Expandido - Cursos Bloqueados */}
                          {isExpanded && lockedCoursesForUser.length > 0 && (
                            <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                              <h4 className="font-semibold text-sm mb-3">Cursos Bloqueados - Liberar Acesso</h4>
                              {lockedCoursesForUser.map((course) => {
                                const hasAccess = userAccesses.includes(course.id);
                                return (
                                  <div 
                                    key={course.id} 
                                    className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{course.title}</p>
                                      {course.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                          {course.description}
                                        </p>
                                      )}
                                    </div>
                                    <Switch
                                      checked={hasAccess}
                                      onCheckedChange={(checked) => {
                                        handleToggleCourseAccess(userId, course.id, checked);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {isExpanded && lockedCoursesForUser.length === 0 && (
                            <div className="border-t border-border bg-muted/30 p-4">
                              <p className="text-sm text-muted-foreground text-center">
                                Nenhum curso bloqueado no momento. Bloqueie cursos na aba "Cursos" para gerenciar acesso aqui.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Pagamentos */}
          <TabsContent value="payments" className="space-y-6">
            {/* Configurações do Gateway */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Configuração de Gateway de Pagamento
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure seu gateway de pagamento e webhook para entrega automática de cursos
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Gateway de Pagamento</Label>
                    <Select 
                      value={paymentSettings.payment_gateway_name}
                      onValueChange={(value) => setPaymentSettings({ ...paymentSettings, payment_gateway_name: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asaas">💳 Asaas</SelectItem>
                        <SelectItem value="stripe">💳 Stripe</SelectItem>
                        <SelectItem value="mercadopago">💳 Mercado Pago</SelectItem>
                        <SelectItem value="pagarme">💳 Pagarme</SelectItem>
                        <SelectItem value="gerencianet">💳 Gerencianet (Efí)</SelectItem>
                        <SelectItem value="paypal">💳 PayPal</SelectItem>
                        <SelectItem value="other">🔧 Outro (personalizado)</SelectItem>
                      </SelectContent>
                    </Select>
                    {paymentSettings.payment_gateway_name === 'other' && (
                      <div className="mt-2">
                        <Input
                          placeholder="Digite o nome do seu gateway (ex: meu-gateway)"
                          value={paymentSettings.payment_gateway_name === 'other' ? '' : paymentSettings.payment_gateway_name}
                          onChange={e => {
                            if (e.target.value && e.target.value !== 'other') {
                              setPaymentSettings({ ...paymentSettings, payment_gateway_name: e.target.value });
                            }
                          }}
                          onBlur={e => {
                            if (!e.target.value) {
                              setPaymentSettings({ ...paymentSettings, payment_gateway_name: 'other' });
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Digite um nome único para identificar seu gateway (será usado no header x-gateway)
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Você pode trocar o gateway a qualquer momento salvando as novas credenciais
                    </p>
                  </div>

                  <div>
                    <Label>
                      API Key do Gateway <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      type="password"
                      placeholder={paymentSettings.payment_gateway_name === 'asaas' ? 'Sua access_token do Asaas' : 
                                  paymentSettings.payment_gateway_name === 'stripe' ? 'sk_test_... ou sk_live_...' :
                                  paymentSettings.payment_gateway_name === 'mercadopago' ? 'APP_USR-...' :
                                  'Sua chave API do gateway'}
                      value={paymentSettings.payment_gateway_api_key}
                      onChange={e => setPaymentSettings({ ...paymentSettings, payment_gateway_api_key: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✅ Apenas a chave de API é obrigatória! Os outros campos são opcionais.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Mantenha suas credenciais seguras. Elas são salvas no banco de dados.
                    </p>
                  </div>

                  <div>
                    <Label>Secret do Gateway (opcional)</Label>
                    <Input 
                      type="password"
                      placeholder="Secret adicional do gateway (apenas se necessário)"
                      value={paymentSettings.payment_gateway_secret}
                      onChange={e => setPaymentSettings({ ...paymentSettings, payment_gateway_secret: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alguns gateways requerem um secret adicional além da API Key
                    </p>
                  </div>

                  <div>
                    <Label>Webhook Secret (opcional - recomendado para produção)</Label>
                    <Input 
                      type="password"
                      placeholder="Secret para validar webhooks (deixe vazio se não usar)"
                      value={paymentSettings.payment_gateway_webhook_secret}
                      onChange={e => setPaymentSettings({ ...paymentSettings, payment_gateway_webhook_secret: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      🔒 Opcional: Configure apenas se quiser validar webhooks. Se deixar vazio, todos os webhooks serão aceitos (útil para testes).
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Se usar, configure o mesmo secret na Edge Function (variável WEBHOOK_SECRET) e no seu gateway
                    </p>
                  </div>

                  <div>
                    <Label>URL do Webhook</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={paymentSettings.payment_webhook_url || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-payment`}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const url = paymentSettings.payment_webhook_url || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-payment`;
                          navigator.clipboard.writeText(url);
                          toast({ title: 'URL copiada!' });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure esta URL no seu gateway de pagamento
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-600">✅ Configuração Simples</p>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1.5">
                          <p><strong>Para começar, você só precisa da API Key do seu gateway!</strong></p>
                          <p>• Preencha a <strong>API Key</strong> (obrigatório) e salve</p>
                          <p>• Os outros campos são opcionais e podem ser configurados depois</p>
                          <p>• O webhook secret é recomendado para produção, mas não é obrigatório</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-600">⚠️ Importante: Segurança</p>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1.5">
                          <p><strong>As credenciais precisam ser válidas do seu gateway de pagamento.</strong></p>
                          <p>• Apenas webhooks do seu gateway serão processados</p>
                          <p>• O webhook precisa estar configurado no seu gateway apontando para a URL acima</p>
                          <p>• O secret do webhook (opcional) valida que o webhook é legítimo</p>
                          <p>• As transações só são liberadas se já existirem no banco (criadas quando o usuário clica em comprar)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-500 rounded-full p-1 mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-500">✅ Como funciona:</p>
                        <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside ml-2">
                          <li className="pl-1">Usuário clica em comprar → Transação é criada no banco</li>
                          <li className="pl-1">Usuário paga no gateway → Gateway processa pagamento</li>
                          <li className="pl-1">Gateway envia webhook → Edge Function valida e processa</li>
                          <li className="pl-1">Se transação existe e pagamento confirmado → Acesso liberado automaticamente</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      📋 Passo a Passo - Configurar Webhook no Gateway:
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-2">
                      <li className="pl-1">
                        <strong>1. Copie a URL do webhook acima</strong> (botão de copiar ao lado)
                      </li>
                      <li className="pl-1">
                        <strong>2. No painel do seu gateway</strong>, vá em "Webhooks" ou "Notificações"
                      </li>
                      <li className="pl-1">
                        <strong>3. Adicione a URL do webhook</strong> copiada
                      </li>
                      <li className="pl-1">
                        <strong>4. Configure os headers:</strong>
                        <div className="mt-1 ml-4 space-y-1">
                          <div>
                            <code className="bg-background px-1.5 py-0.5 rounded text-blue-600 text-xs">
                              x-gateway: {paymentSettings.payment_gateway_name || 'SEU_GATEWAY'}
                            </code>
                          </div>
                          {paymentSettings.payment_gateway_webhook_secret && (
                            <div>
                              <code className="bg-background px-1.5 py-0.5 rounded text-blue-600 text-xs">
                                Authorization: Bearer {paymentSettings.payment_gateway_webhook_secret}
                              </code>
                            </div>
                          )}
                        </div>
                      </li>
                      <li className="pl-1">
                        <strong>5. Eventos a configurar:</strong> Pagamento confirmado, Pagamento aprovado, Status atualizado para "pago"
                      </li>
                      <li className="pl-1">
                        <strong>6. Teste:</strong> Faça um pagamento de teste e verifique se o acesso foi liberado automaticamente
                      </li>
                    </ol>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      🔒 <strong>Segurança:</strong> Apenas webhooks válidos do seu gateway (com secret correto) e transações que já existem no banco serão processados. Não é possível liberar acesso sem um pagamento real confirmado pelo gateway.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testGatewayConnection}
                      disabled={testingConnection || !paymentSettings.payment_gateway_api_key || savingPayment}
                      variant="outline"
                      className="gap-2"
                    >
                      {testingConnection ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={savePaymentSettings}
                      disabled={savingPayment || !paymentSettings.payment_gateway_api_key || testingConnection}
                      className="flex-1 gap-2"
                    >
                      {savingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </div>
                  {!paymentSettings.payment_gateway_api_key && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      ⚠️ Preencha a API Key para salvar as configurações
                    </p>
                  )}
                  {paymentSettings.payment_gateway_api_key && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Dica:</strong> Clique em "Testar Conexão" para verificar se suas credenciais estão corretas antes de salvar.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Transações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Histórico de Transações
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Últimas 50 transações de pagamento
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchTransactions}
                    disabled={loadingTransactions}
                  >
                    <Loader2 className={`w-4 h-4 mr-2 ${loadingTransactions ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction: any) => {
                      const statusColors: Record<string, string> = {
                        paid: 'bg-green-500/20 text-green-500 border-green-500/30',
                        pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                        failed: 'bg-red-500/20 text-red-500 border-red-500/30',
                        cancelled: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
                        refunded: 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                      };

                      const statusIcons: Record<string, any> = {
                        paid: CheckCircle2,
                        pending: Clock,
                        failed: XCircleIcon,
                        cancelled: XCircleIcon,
                        refunded: XCircleIcon
                      };

                      const StatusIcon = statusIcons[transaction.status] || Clock;
                      const statusColor = statusColors[transaction.status] || statusColors.pending;

                      return (
                        <div key={transaction.id} className="border border-border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${statusColor}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {transaction.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {transaction.gateway_name}
                                </span>
                              </div>
                              <p className="font-medium">
                                {transaction.courses?.title || 'Curso removido'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.profiles?.full_name || transaction.profiles?.email || 'Usuário desconhecido'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {transaction.transaction_id}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                R$ {parseFloat(transaction.amount || '0').toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {transaction.paid_at && (
                            <p className="text-xs text-muted-foreground">
                              Pago em: {new Date(transaction.paid_at).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Email de Suporte</Label>
                    <Input 
                      type="email" 
                      placeholder="suporte@exemplo.com" 
                      value={generalSettings.support_email}
                      onChange={e => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>URL de Termos de Uso</Label>
                    <Input 
                      placeholder="https://exemplo.com/termos" 
                      value={generalSettings.terms_url}
                      onChange={e => setGeneralSettings({ ...generalSettings, terms_url: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>URL de Política de Privacidade</Label>
                    <Input 
                      placeholder="https://exemplo.com/privacidade" 
                      value={generalSettings.privacy_url}
                      onChange={e => setGeneralSettings({ ...generalSettings, privacy_url: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={saveGeneralSettings}
                    disabled={savingGeneral}
                    className="w-full gap-2"
                  >
                    {savingGeneral ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Module Confirmation Dialog */}
      <AlertDialog open={!!deleteModuleId} onOpenChange={() => setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este módulo? Todas as aulas deste módulo também serão excluídas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteModuleId && deleteModule(deleteModuleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este curso? Todos os módulos e aulas deste curso também serão excluídos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCourseId && deleteCourse(deleteCourseId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
