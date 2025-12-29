import { useNavigate } from 'react-router-dom';
import { ConversationalChat } from '@/components/ai/ConversationalChat';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const AnalistaAtendimento = () => {
  const navigate = useNavigate();

  const questions = [
    {
      id: 'nicho',
      question: '🏢 Qual é seu nicho ou área de atuação?',
      placeholder: 'Ex: Emagrecimento, marketing digital, estética, educação financeira...',
      key: 'nicho'
    },
    {
      id: 'produto',
      question: '📦 O que você vende? Descreva seu produto ou serviço principal.',
      placeholder: 'Ex: Mentoria de 3 meses, curso online, consultoria, produto físico...',
      key: 'produto'
    },
    {
      id: 'preco',
      question: '💰 Qual o preço do seu produto/serviço?',
      placeholder: 'Ex: R$497, R$1.997, R$97/mês...',
      key: 'preco'
    },
    {
      id: 'beneficio',
      question: '✨ Qual a principal transformação ou benefício que você entrega?',
      placeholder: 'Ex: Perder 15kg em 90 dias, dobrar o faturamento, ter a pele dos sonhos...',
      key: 'beneficio'
    },
    {
      id: 'garantia',
      question: '🛡️ Você oferece alguma garantia? Qual?',
      placeholder: 'Ex: 7 dias de garantia, dinheiro de volta, suporte vitalício...',
      key: 'garantia'
    },
    {
      id: 'objecoes',
      question: '🤔 Quais são as objeções mais comuns dos seus leads?',
      placeholder: 'Ex: "Tá caro", "Preciso pensar", "Será que funciona pra mim?"...',
      key: 'objecoes'
    },
    {
      id: 'canais',
      question: '📱 Por quais canais você atende? (WhatsApp, DM, telefone...)',
      placeholder: 'Ex: WhatsApp, Direct do Instagram, e-mail...',
      key: 'canais'
    }
  ];

  const handleGenerateResult = async (answers: Record<string, string>): Promise<string> => {
    const prompt = `Crie scripts completos de atendimento e vendas baseados nas seguintes informações:

**NICHO:** ${answers.nicho}
**PRODUTO/SERVIÇO:** ${answers.produto}
**PREÇO:** ${answers.preco}
**BENEFÍCIO PRINCIPAL:** ${answers.beneficio}
**GARANTIA:** ${answers.garantia}
**OBJEÇÕES COMUNS:** ${answers.objecoes}
**CANAIS DE ATENDIMENTO:** ${answers.canais}

Por favor, crie os seguintes scripts formatados e prontos para usar:

1. 👋 **SCRIPT DE BOAS-VINDAS** (quando o lead chega)
   - Versão curta (1-2 mensagens)
   - Versão detalhada (para leads mais qualificados)

2. 🔍 **SCRIPT DE QUALIFICAÇÃO** (perguntas para entender o lead)
   - Sequência de perguntas estratégicas
   - Como interpretar as respostas

3. 📦 **SCRIPT DE APRESENTAÇÃO DO PRODUTO**
   - Como apresentar os benefícios
   - Como criar desejo
   - Headlines e frases de impacto

4. 🎤 **PITCH DE VENDAS COMPLETO**
   - Abertura
   - Desenvolvimento
   - Fechamento com CTA

5. 🛡️ **SCRIPTS PARA QUEBRA DE OBJEÇÕES**
   - Script para cada objeção mencionada
   - Técnicas de contorno

6. ⏰ **SCRIPT DE URGÊNCIA** (quando o lead demora)
   - Follow-up 24h
   - Follow-up 48h
   - Último aviso

7. ✅ **SCRIPT DE FECHAMENTO**
   - Como confirmar a venda
   - Como pegar os dados
   - Próximos passos

8. 🎁 **SCRIPTS DE PÓS-VENDA**
   - Confirmação de compra
   - Onboarding (primeira semana)
   - Pedido de depoimento
   - Oferta de upsell

9. 💡 **DICAS DE ATENDIMENTO**
   - Melhores práticas
   - Erros a evitar
   - Horários ideais

Use emojis, seja humanizado e prático. Os scripts devem estar prontos para copiar e colar no ${answers.canais}.`;

    return await callGeminiAPI(prompt, AI_SYSTEM_PROMPTS.atendimento);
  };

  return (
    <ConversationalChat
      title="Analista de Atendimento"
      description="Vou criar scripts de vendas para você"
      questions={questions}
      welcomeMessage="💬 Oi! Sou especialista em atendimento e vendas! Vou criar scripts personalizados para você converter mais leads em clientes. Vamos começar?"
      onGenerateResult={handleGenerateResult}
      onBack={() => navigate('/members')}
      resultTitle="Seus Scripts de Vendas"
    />
  );
};

export default AnalistaAtendimento;
