import { useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const IACriativo = () => {
  const navigate = useNavigate();

  const handleSendMessage = async (message: string): Promise<string> => {
    return await callGeminiAPI(message, AI_SYSTEM_PROMPTS.criativo);
  };

  return (
    <ChatInterface
      title="IA de Criativo"
      description="Gere ideias criativas e conceitos visuais"
      placeholder="Ex: Preciso de ideias para uma campanha de lançamento..."
      onSendMessage={handleSendMessage}
      onBack={() => navigate('/members')}
    />
  );
};

export default IACriativo;
