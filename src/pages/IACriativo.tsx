import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ai/ChatInterface';

const IACriativo = () => {
  const navigate = useNavigate();

  const handleSendMessage = async (message: string): Promise<string> => {
    // TODO: Integrar com API de IA para geração criativa
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ideia') || lowerMessage.includes('criar') || lowerMessage.includes('campanha')) {
      return `Aqui estão algumas ideias criativas baseadas na sua solicitação:\n\n💡 **Conceito Principal:**\n${message}\n\n🎨 **Direções Criativas:**\n1. Abordagem visual impactante com cores vibrantes\n2. Narrativa storytelling que conecta emocionalmente\n3. Elementos interativos para engajamento\n4. Formatos diversos (vídeo, imagem, carrossel)\n\n📱 **Canais Sugeridos:**\n- Instagram (feed e stories)\n- Facebook\n- LinkedIn (para B2B)\n\nQuer que eu detalhe alguma dessas direções?`;
    }
    
    if (lowerMessage.includes('hashtag') || lowerMessage.includes('hashtags')) {
      return `Sugestões de hashtags:\n\n#${message.replace(/\s+/g, '')}\n#${message.replace(/\s+/g, '')}Marketing\n#${message.replace(/\s+/g, '')}Digital\n#MarketingDigital\n#ConteúdoCriativo\n#EstratégiaDigital\n\nQuantas hashtags você precisa? Posso criar uma lista personalizada.`;
    }
    
    return `Olá! Sou sua assistente de criatividade. Posso ajudar você com:\n\n✨ Geração de ideias criativas\n🎨 Conceitos visuais\n📱 Estratégias para redes sociais\n🎬 Roteiros e narrativas\n🏷️ Hashtags e legendas\n🎯 Briefings criativos\n\nConte-me sobre o seu projeto ou desafio criativo e vamos criar algo incrível juntos!`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <ChatInterface
          title="IA de Criativo"
          description="Gere ideias criativas, conceitos visuais e estratégias para suas campanhas"
          placeholder="Ex: Preciso de ideias para uma campanha de lançamento..."
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default IACriativo;


