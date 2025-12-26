import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Award, Sparkles, ChevronRight, Star, Zap, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Play,
      title: 'Aulas em Vídeo',
      desc: 'Conteúdo premium em alta qualidade com acesso ilimitado',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Comunidade Exclusiva',
      desc: 'Conecte-se com outros membros e evolua junto',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Certificados',
      desc: 'Comprove sua evolução com certificados reconhecidos',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      icon: Zap,
      title: 'Ferramentas IA',
      desc: 'Acesso a IAs exclusivas para acelerar seus resultados',
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  const testimonials = [
    { name: 'Carlos M.', text: 'Transformou completamente minha forma de trabalhar!', rating: 5 },
    { name: 'Ana P.', text: 'O melhor investimento que fiz para minha carreira.', rating: 5 },
    { name: 'Pedro S.', text: 'Conteúdo de qualidade e suporte excepcional.', rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">MemberZone</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/auth')}
            >
              Entrar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
              onClick={() => navigate('/auth')}
            >
              Começar agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80">Plataforma #1 em resultados</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="text-white">Sua jornada de</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent animate-pulse-soft">
                sucesso começa aqui
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Acesse conteúdo exclusivo, ferramentas de IA avançadas e uma comunidade
              que vai acelerar seus resultados como nunca antes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 h-14 px-8 text-lg group"
                onClick={() => navigate('/auth')}
              >
                <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                Começar agora
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-lg"
                onClick={() => navigate('/auth')}
              >
                Ver planos
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 pt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-white/60">+1.000 membros ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 p-1">
            <div className="w-1.5 h-3 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que você precisa para evoluir
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Uma plataforma completa com as melhores ferramentas e conteúdos para sua jornada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10 blur-xl`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O que nossos membros dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">"{item.text}"</p>
                <p className="text-sm text-white/50 font-medium">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-white/10 p-12 md:p-16 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Garantia de 7 dias</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Pronto para transformar sua vida?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                Junte-se a milhares de pessoas que já estão alcançando resultados extraordinários.
              </p>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 h-14 px-10 text-lg"
                onClick={() => navigate('/auth')}
              >
                <Zap className="w-5 h-5" />
                Começar agora mesmo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white/60 text-sm">© 2024 MemberZone. Todos os direitos reservados.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
