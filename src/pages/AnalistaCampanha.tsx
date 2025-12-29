import { useNavigate } from 'react-router-dom';
import { ConversationalChat } from '@/components/ai/ConversationalChat';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const AnalistaCampanha = () => {
  const navigate = useNavigate();

  const questions = [
    {
      id: 'plataforma',
      question: '📊 Em qual plataforma está sua campanha?',
      placeholder: 'Ex: Facebook Ads, Google Ads, Instagram, TikTok Ads...',
      key: 'plataforma'
    },
    {
      id: 'objetivo',
      question: '🎯 Qual o objetivo da campanha? O que você quer alcançar?',
      placeholder: 'Ex: Vendas, leads, tráfego para site, engajamento, cadastros...',
      key: 'objetivo'
    },
    {
      id: 'investimento',
      question: '💰 Quanto você está investindo? (por dia ou total)',
      placeholder: 'Ex: R$50 por dia, R$1.000 total na campanha...',
      key: 'investimento'
    },
    {
      id: 'metricas',
      question: '📈 Quais são suas métricas atuais? (CTR, CPC, CPM, conversões)',
      placeholder: 'Ex: CTR 1.5%, CPC R$0.80, 10 vendas, CPM R$15...',
      key: 'metricas'
    },
    {
      id: 'publico',
      question: '👥 Como está configurada sua segmentação de público?',
      placeholder: 'Ex: Mulheres 25-45, interesse em emagrecimento, lookalike de compradores...',
      key: 'publico'
    },
    {
      id: 'problemas',
      question: '⚠️ Quais problemas você está enfrentando? O que não está dando certo?',
      placeholder: 'Ex: CTR baixo, muitos cliques mas poucas vendas, custo alto...',
      key: 'problemas'
    },
    {
      id: 'criativos',
      question: '🎬 Quantos criativos você tem rodando? Quais formatos?',
      placeholder: 'Ex: 5 criativos, sendo 3 vídeos e 2 imagens estáticas...',
      key: 'criativos'
    }
  ];

  const handleGenerateResult = async (answers: Record<string, string>): Promise<string> => {
    const prompt = `Analise a campanha de anúncios com base nas seguintes informações e forneça recomendações detalhadas:

**PLATAFORMA:** ${answers.plataforma}
**OBJETIVO:** ${answers.objetivo}
**INVESTIMENTO:** ${answers.investimento}
**MÉTRICAS ATUAIS:** ${answers.metricas}
**SEGMENTAÇÃO:** ${answers.publico}
**PROBLEMAS RELATADOS:** ${answers.problemas}
**CRIATIVOS:** ${answers.criativos}

Por favor, forneça:

1. 📊 **DIAGNÓSTICO GERAL**
   - Avaliação das métricas (bom, médio, precisa melhorar)
   - Comparação com benchmarks do mercado
   - Identificação do principal gargalo

2. ⚠️ **PROBLEMAS IDENTIFICADOS** (prioridade alta para baixa)
   - Problema 1: [descrição e impacto]
   - Problema 2: [descrição e impacto]
   - etc.

3. 🎯 **RECOMENDAÇÕES DE PÚBLICO**
   - Ajustes na segmentação
   - Novos públicos para testar
   - O que excluir

4. 🎬 **RECOMENDAÇÕES DE CRIATIVOS**
   - O que está funcionando
   - O que precisa mudar
   - Novos formatos para testar
   - Sugestões de hooks/ganchos

5. 💰 **OTIMIZAÇÃO DE ORÇAMENTO**
   - Redistribuição sugerida
   - Quanto investir em cada teste
   - Quando escalar

6. 📋 **PLANO DE AÇÃO** (próximos 7 dias)
   - Dia 1-2: [ações]
   - Dia 3-4: [ações]
   - Dia 5-7: [ações]

7. 📈 **METAS REALISTAS**
   - Métricas ideais para alcançar
   - Timeline estimado

8. 💡 **DICAS EXTRAS**
   - Insights personalizados
   - Erros a evitar

Seja específico, prático e direto ao ponto. O cliente precisa de ações claras para implementar.`;

    return await callGeminiAPI(prompt, AI_SYSTEM_PROMPTS.campanha);
  };

  return (
    <ConversationalChat
      title="Analista de Campanha"
      description="Vou analisar e otimizar seus anúncios"
      questions={questions}
      welcomeMessage="📊 Olá! Sou seu analista de campanhas! Vou analisar seus anúncios e te dar recomendações práticas para melhorar seus resultados. Me conta sobre sua campanha?"
      onGenerateResult={handleGenerateResult}
      onBack={() => navigate('/members')}
      resultTitle="Análise da Sua Campanha"
    />
  );
};

export default AnalistaCampanha;
