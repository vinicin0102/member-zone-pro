import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isAdmin, loading, user, profile } = useAuth();
  const navigate = useNavigate();

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
    return <Navigate to="/auth" replace />;
  }

  // Verifica isAdmin ou email admin@gmail.com como fallback
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você precisa ser administrador para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Email atual: {user?.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Status Admin: {profile?.is_admin ? 'Sim' : 'Não'}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => navigate('/members')} variant="outline">
              Voltar para Área de Membros
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
