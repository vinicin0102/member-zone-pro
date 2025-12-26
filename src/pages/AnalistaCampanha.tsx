import { useNavigate } from 'react-router-dom';
import { ChatInterfaceWithImage } from '@/components/ai/ChatInterfaceWithImage';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const AnalistaCampanha = () => {
  const navigate = useNavigate();

  const handleSendMessage = async (message: string, images?: File[]): Promise<string> => {
    // Se há imagens, adicionar contexto sobre a análise
    let contextMessage = message;

    if (images && images.length > 0) {
      contextMessage = `O usuário enviou ${images.length} print(s) do gerenciador de anúncios para análise. 
      
Mensagem do usuário: ${message || 'Analise minha campanha'}

Por favor, forneça uma análise detalhada simulada com:
1. Métricas identificadas (CTR, CPC, CPM, ROAS estimados)
2. Problemas identificados
3. Recomendações de otimização
4. Quais anúncios pausar ou escalar
5. Próximos passos

Nota: Como não temos acesso visual real à imagem, forneça uma análise genérica mas útil baseada em padrões comuns de otimização.`;
    }

    return await callGeminiAPI(contextMessage, AI_SYSTEM_PROMPTS.campanha);
  };

  return (
    <ChatInterfaceWithImage
      title="Analista de Campanha"
      description="Envie prints para análise de performance"
      placeholder="Ou digite uma pergunta sobre sua campanha..."
      onSendMessage={handleSendMessage}
      onBack={() => navigate('/members')}
    />
  );
};

export default AnalistaCampanha;
