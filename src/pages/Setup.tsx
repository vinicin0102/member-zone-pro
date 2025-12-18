import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Setup = () => {
  const { user, loading: authLoading, signUp } = useAuth();
  const navigate = useNavigate();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: 'admin@gmail.com',
    password: '',
    fullName: 'Administrador'
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]); // Re-executa quando o usuário muda

  const checkAdminStatus = async () => {
    try {
      // Se não há usuário logado, não podemos verificar - assumimos que não há admin
      if (!user) {
        setHasAdmin(false);
        setChecking(false);
        return;
      }

      // Tenta verificar o próprio perfil primeiro
      const { data: ownProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      // Se o usuário atual já é admin, então já existe admin
      if (ownProfile?.is_admin) {
        setHasAdmin(true);
        setChecking(false);
        return;
      }

      // Tenta verificar se existe algum admin (pode falhar por RLS se não for admin)
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('is_admin', true)
        .limit(1);

      // Se deu erro (provavelmente RLS), assumimos que não há admin ainda
      if (error) {
        console.log('Não foi possível verificar status de admin (normal se não houver admin ainda)');
        setHasAdmin(false);
      } else {
        setHasAdmin((data && data.length > 0) || false);
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      // Em caso de erro, assumimos que não há admin para permitir a criação
      setHasAdmin(false);
    } finally {
      setChecking(false);
    }
  };

  const createAdminAccount = async () => {
    if (!adminForm.email.trim() || !adminForm.password.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha email e senha',
        variant: 'destructive'
      });
      return;
    }

    if (adminForm.password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    setCreatingAdmin(true);

    try {
      // Criar conta
      const { data: signUpData, error: signUpError } = await signUp(
        adminForm.email.trim(),
        adminForm.password,
        adminForm.fullName.trim()
      );

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Falha ao criar usuário');
      }

      // Aguardar um pouco para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Tornar admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('user_id', signUpData.user.id);

      if (updateError) {
        console.error('Erro ao tornar admin:', updateError);
        // Mesmo se falhar, o usuário foi criado
        toast({
          title: 'Conta criada!',
          description: 'Conta criada com sucesso. Você pode torná-la admin manualmente no SQL Editor.',
        });
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Conta de administrador criada! Faça login para continuar.',
        });
      }

      // Redirecionar para login
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      let errorMessage = error.message;
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'Este email já está cadastrado. Faça login e use a opção abaixo para tornar-se admin.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage || 'Não foi possível criar a conta de admin.',
        variant: 'destructive'
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const makeFirstAdmin = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para se tornar admin',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    setMakingAdmin(true);

    try {
      // Tenta fazer update direto do próprio perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Sucesso!',
        description: 'Você agora é administrador. Recarregando...'
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error making admin:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível tornar você admin. Execute o SQL no Supabase Dashboard.',
        variant: 'destructive'
      });
    } finally {
      setMakingAdmin(false);
    }
  };

  // Se já existe admin, redireciona
  useEffect(() => {
    if (hasAdmin === true) {
      toast({
        title: 'Setup já concluído',
        description: 'Já existe um administrador no sistema.'
      });
      navigate('/');
    }
  }, [hasAdmin, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (hasAdmin === true) {
    return null; // Redirecionamento em andamento
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <Card className="border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
            <CardDescription>
              Configure o primeiro administrador do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              <>
                {/* Formulário para criar conta admin */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Email do Administrador</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="vinicius01@gmail.com"
                      value={adminForm.email}
                      onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                      disabled={creatingAdmin}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="admin-name">Nome Completo</Label>
                    <Input
                      id="admin-name"
                      type="text"
                      placeholder="Administrador"
                      value={adminForm.fullName}
                      onChange={e => setAdminForm({ ...adminForm, fullName: e.target.value })}
                      disabled={creatingAdmin}
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={adminForm.password}
                        onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                        disabled={creatingAdmin}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={creatingAdmin}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={createAdminAccount}
                    disabled={creatingAdmin || !adminForm.email.trim() || !adminForm.password.trim()}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {creatingAdmin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Criar Conta de Administrador
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Já tem uma conta?</AlertTitle>
                  <AlertDescription className="mt-2">
                    Faça login e depois volte aqui para tornar-se administrador.
                  </AlertDescription>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                  >
                    Fazer Login
                  </Button>
                </Alert>
              </>
            ) : (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Usuário logado</AlertTitle>
                  <AlertDescription>
                    Olá, {user.email}! Você será o primeiro administrador.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      O que acontecerá:
                    </Label>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4 list-disc">
                      <li>Você terá acesso completo ao painel administrativo</li>
                      <li>Poderá adicionar e gerenciar módulos e aulas</li>
                      <li>Poderá gerenciar usuários e acesso premium</li>
                    </ul>
                  </div>

                  <Button
                    onClick={makeFirstAdmin}
                    disabled={makingAdmin}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {makingAdmin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Tornar-me Administrador
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Ou execute no SQL Editor do Supabase:
                  </p>
                  <code className="block mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                    SELECT public.make_first_user_admin();
                  </code>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;

