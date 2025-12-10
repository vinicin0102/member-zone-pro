import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Play, Users, Award } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-xl">MemberHub</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/auth')}>Entrar</Button>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight">
            Sua plataforma de <span className="gradient-text">cursos online</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Acesse conteúdo exclusivo, acompanhe seu progresso e evolua no seu ritmo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate('/auth')}>
              Começar agora <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { icon: Play, title: 'Aulas em Vídeo', desc: 'Conteúdo de alta qualidade' },
            { icon: Users, title: 'Comunidade', desc: 'Aprenda com outros alunos' },
            { icon: Award, title: 'Certificado', desc: 'Comprove sua evolução' }
          ].map((item, i) => (
            <div key={i} className="bg-card p-6 rounded-xl border text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <item.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
