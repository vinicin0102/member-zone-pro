import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowRight, Sparkles, Check } from 'lucide-react';

const Upgrade = () => {
  const navigate = useNavigate();

  const features = [
    'Acesso a todas as aulas do curso',
    'Materiais exclusivos em PDF',
    'Suporte prioritário via chat',
    'Certificado de conclusão',
    'Atualizações vitalícias',
    'Comunidade exclusiva'
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-premium to-primary flex items-center justify-center animate-glow">
            <Crown className="w-10 h-10 text-premium-foreground" />
          </div>
          
          <h1 className="font-display text-4xl font-bold text-foreground">
            Seja <span className="gradient-text">Premium</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Desbloqueie todo o conteúdo e acelere seu aprendizado
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-display font-bold text-foreground">R$ 97</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cancele quando quiser
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Começar agora
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Pagamento seguro • Garantia de 7 dias
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/members')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar para a área de membros
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
