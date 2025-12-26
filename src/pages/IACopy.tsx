import { useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const IACopy = () => {
  const navigate = useNavigate();

  const handleSendMessage = async (message: string): Promise<string> => {
    return await callGeminiAPI(message, AI_SYSTEM_PROMPTS.copy);
  };

  return (
    <ChatInterface
      title="IA de Copy"
      description="Crie textos persuasivos e títulos chamativos"
      placeholder="Ex: Crie um título para um produto de emagrecimento..."
      onSendMessage={handleSendMessage}
      onBack={() => navigate('/members')}
    />
  );
};

export default IACopy;
