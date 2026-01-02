import { useNavigate } from 'react-router-dom';
import { ConversationalChat } from '@/components/ai/ConversationalChat';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const IACriativo = () => {
  const navigate = useNavigate();

  const questions = [
    {
      id: 'campanha',
      question: '🎯 Qual é o objetivo da sua campanha ou conteúdo?',
      placeholder: 'Ex: Lançamento de produto, Black Friday, engajamento no Instagram...',
      key: 'campanha'
    },
    {
      id: 'produto',
      question: '📦 O que você está promovendo? Descreva seu produto ou serviço.',
      placeholder: 'Ex: Curso online de confeitaria, loja de roupas femininas, consultoria...',
      key: 'produto'
    },
    {
      id: 'publico',
      question: '👥 Quem é seu público? Como eles pensam e o que valorizam?',
      placeholder: 'Ex: Jovens de 18-30 que gostam de tecnologia, mães que buscam praticidade...',
      key: 'publico'
    },
    {
      id: 'formato',
      question: '📱 Quais formatos você quer criar? Onde será publicado?',
      placeholder: 'Ex: Reels, Carrossel, Stories, TikTok, YouTube Shorts, Posts estáticos...',
      key: 'formato'
    },
    {
      id: 'referencias',
      question: '✨ Tem alguma referência ou estilo que você gosta? Marcas que admira?',
      placeholder: 'Ex: Estilo minimalista, vibe Netflix, tom como a Nubank, cores vibrantes...',
      key: 'referencias'
    },
    {
      id: 'diferencial',
      question: '💎 Qual o diferencial do seu produto? O que te destaca da concorrência?',
      placeholder: 'Ex: Atendimento 24h, garantia de 90 dias, método exclusivo, preço justo...',
      key: 'diferencial'
    }
  ];

  const handleGenerateResult = async (answers: Record<string, string>): Promise<string> => {
    const prompt = `Crie ideias criativas completas para uma campanha baseada nas seguintes informações:

**OBJETIVO DA CAMPANHA:** ${answers.campanha}
**PRODUTO/SERVIÇO:** ${answers.produto}
**PÚBLICO-ALVO:** ${answers.publico}
**FORMATOS DESEJADOS:** ${answers.formato}
**REFERÊNCIAS/ESTILO:** ${answers.referencias}
**DIFERENCIAL:** ${answers.diferencial}

Por favor, gere:

1. 🎨 **CONCEITO CRIATIVO PRINCIPAL**
   - Nome/tema da campanha
   - Mensagem central
   - Moodboard descritivo (cores, fontes, estilo visual)

2. 📱 **5 IDEIAS DE CONTEÚDO** para os formatos mencionados
   - Título/hook de cada peça
   - Descrição do conteúdo
   - Texto/copy sugerido
   - CTA

3. 🎬 **ROTEIRO PARA VÍDEO CURTO** (Reels/TikTok)
   - Gancho inicial (primeiros 3 segundos)
   - Desenvolvimento
   - CTA final
   - Duração sugerida

4. 📸 **IDEIAS PARA CARROSSEL** (se aplicável)
   - Estrutura slide por slide
   - Texto de cada slide
   - CTA final

5. 📅 **CALENDÁRIO DE PUBLICAÇÃO** sugerido (1 semana)

6. 🏷️ **HASHTAGS** relevantes (15-20)

7. 💡 **DICAS DE PRODUÇÃO** personalizadas

Use emojis, seja criativo e inovador. Pense em tendências atuais de redes sociais.
    
IMPORTANTE: NÃO me dê instruções de como fazer. NÃO descreva o processo. APENAS GERE O CONTEÚDO FINAL solicitado.`;

    return await callGeminiAPI(prompt, AI_SYSTEM_PROMPTS.criativo);
  };

  return (
    <ConversationalChat
      title="IA de Criativo"
      description="Vou gerar ideias criativas incríveis"
      questions={questions}
      welcomeMessage="🎨 Oi! Sou sua IA criativa! Vou te ajudar a ter ideias incríveis para suas campanhas e conteúdos. Bora criar juntos?"
      onGenerateResult={handleGenerateResult}
      onBack={() => navigate('/members')}
      resultTitle="Suas Ideias Criativas"
    />
  );
};

export default IACriativo;
