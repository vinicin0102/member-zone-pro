import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGuardProps {
  children: React.ReactNode;
}

export const PremiumGuard = ({ children }: PremiumGuardProps) => {
  const { isPremium, loading } = useAuth();
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

  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-premium/20 to-primary/20 flex items-center justify-center">
            <Crown className="w-10 h-10 text-premium" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Conteúdo Premium
            </h1>
            <p className="text-muted-foreground">
              Esta área é exclusiva para membros premium. Faça upgrade para ter acesso completo ao conteúdo.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Acesso a todas as aulas</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Materiais exclusivos</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Suporte prioritário</span>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={() => navigate('/upgrade')}
          >
            Fazer Upgrade
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
