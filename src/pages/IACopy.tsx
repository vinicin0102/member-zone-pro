import { useNavigate } from 'react-router-dom';
import { ConversationalChat } from '@/components/ai/ConversationalChat';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const IACopy = () => {
  const navigate = useNavigate();

  const questions = [
    {
      id: 'objetivo',
      question: '🎯 Qual é o objetivo da sua copy? O que você quer que a pessoa faça?',
      placeholder: 'Ex: Quero que comprem meu curso, baixem o e-book, agendem uma consulta...',
      key: 'objetivo'
    },
    {
      id: 'produto',
      question: '📦 O que você está vendendo ou promovendo? Descreva brevemente.',
      placeholder: 'Ex: Curso de marketing digital para iniciantes, mentoria de emagrecimento...',
      key: 'produto'
    },
    {
      id: 'publico',
      question: '👥 Quem é seu público-alvo? Descreva a pessoa ideal.',
      placeholder: 'Ex: Mulheres de 25-40 anos que querem emagrecer, empreendedores...',
      key: 'publico'
    },
    {
      id: 'beneficio',
      question: '✨ Qual o principal benefício ou transformação que você oferece?',
      placeholder: 'Ex: Perder 10kg em 90 dias, ganhar R$5.000/mês extra, ter mais tempo livre...',
      key: 'beneficio'
    },
    {
      id: 'canal',
      question: '📱 Onde essa copy vai ser usada?',
      placeholder: 'Ex: Instagram, Facebook Ads, E-mail marketing, WhatsApp, Landing page...',
      key: 'canal'
    },
    {
      id: 'tom',
      question: '🎭 Qual tom de voz você quer? Como você fala com seu público?',
      placeholder: 'Ex: Profissional, descontraído, urgente, empático, provocador...',
      key: 'tom'
    }
  ];

  const handleGenerateResult = async (answers: Record<string, string>): Promise<string> => {
    const prompt = `Crie uma copy persuasiva completa baseada nas seguintes informações:

**OBJETIVO:** ${answers.objetivo}
**PRODUTO/SERVIÇO:** ${answers.produto}
**PÚBLICO-ALVO:** ${answers.publico}
**PRINCIPAL BENEFÍCIO:** ${answers.beneficio}
**CANAL DE USO:** ${answers.canal}
**TOM DE VOZ:** ${answers.tom}

Por favor, gere:

1. 📌 **3 OPÇÕES DE HEADLINE** (título chamativo)
   - Versão com curiosidade
   - Versão com benefício direto
   - Versão com urgência

2. 📝 **COPY COMPLETA** adequada para o canal mencionado
   - Lead (abertura que chama atenção)
   - Corpo (desenvolvimento com benefícios)
   - CTA (chamada para ação)

3. 🎯 **VARIAÇÕES DE CTA** (3 opções)

4. 📱 **VERSÃO ADAPTADA** para o canal específico

5. 💡 **DICAS DE MELHORIA** personalizadas

Use emojis, formatação markdown e linguagem persuasiva. A copy deve estar pronta para copiar e usar.`;

    return await callGeminiAPI(prompt, AI_SYSTEM_PROMPTS.copy);
  };

  return (
    <ConversationalChat
      title="IA de Copy"
      description="Vou criar textos persuasivos para você"
      questions={questions}
      welcomeMessage="👋 Olá! Sou sua IA especialista em copywriting! Vou criar textos persuasivos perfeitos para você vender mais. Vamos começar com algumas perguntas rápidas?"
      onGenerateResult={handleGenerateResult}
      onBack={() => navigate('/members')}
      resultTitle="Sua Copy Personalizada"
    />
  );
};

export default IACopy;
