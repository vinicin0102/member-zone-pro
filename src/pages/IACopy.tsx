import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/ai/ChatInterface';

const IACopy = () => {
  const navigate = useNavigate();

  const handleSendMessage = async (message: string): Promise<string> => {
    // TODO: Integrar com API de IA (OpenAI, Claude, etc.)
    // Por enquanto, simulação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Resposta simulada baseada no contexto
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('copy') || lowerMessage.includes('texto') || lowerMessage.includes('conteúdo')) {
      return `Aqui está uma sugestão de copy para você:\n\n"${message}"\n\nEsta mensagem pode ser adaptada para diferentes formatos como:\n- Posts em redes sociais\n- Emails marketing\n- Landing pages\n- Anúncios\n\nPosso ajudar você a refinar este copy ou criar variações. O que você gostaria de melhorar?`;
    }
    
    if (lowerMessage.includes('título') || lowerMessage.includes('headline')) {
      return `Sugestões de títulos:\n\n1. "${message} - Descubra Como"\n2. "O Guia Definitivo: ${message}"\n3. "${message}: Tudo Que Você Precisa Saber"\n\nQual desses estilos você prefere? Posso criar mais variações.`;
    }
    
    return `Entendi que você precisa de ajuda com copywriting. Posso ajudar você com:\n\n- Criar textos persuasivos\n- Escrever títulos chamativos\n- Desenvolver CTAs efetivos\n- Adaptar copy para diferentes canais\n- Refinar mensagens existentes\n\nMe diga mais sobre o que você precisa criar e eu te ajudo!`;
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
          title="IA de Copy"
          description="Crie textos persuasivos, títulos chamativos e copy para seus projetos"
          placeholder="Ex: Crie um título para um produto de marketing digital..."
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default IACopy;


