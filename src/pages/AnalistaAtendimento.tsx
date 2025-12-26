import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AtendimentoQuestionario, type QuestionarioData } from '@/components/ai/AtendimentoQuestionario';
import { callGeminiAPI, AI_SYSTEM_PROMPTS } from '@/services/aiService';

const AnalistaAtendimento = () => {
  const navigate = useNavigate();

  const generateScripts = async (data: QuestionarioData): Promise<string> => {
    const prompt = `Com base nas seguintes informações do usuário, gere scripts completos e personalizados de atendimento e vendas:

**BOAS-VINDAS:**
${data.boasVindas}

**TIPO DE PRODUTO:**
${data.tipoProduto}

**VALOR PRINCIPAL DO PRODUTO:**
${data.valorProduto}

**APRESENTAÇÃO DO PRODUTO:**
${data.ofertaProduto}

**PITCH DE VENDAS:**
${data.pitch}

**OBJEÇÕES COMUNS:**
${data.objeccoes}

Por favor, gere os seguintes scripts formatados em markdown:

1. 👋 SCRIPT DE BOAS-VINDAS (versão original e versão otimizada)
2. 📦 SCRIPT DE APRESENTAÇÃO DO PRODUTO
3. 🎤 PITCH DE VENDAS COMPLETO com CTA
4. 🛡️ SCRIPTS PARA CADA OBJEÇÃO mencionada
5. ✅ SCRIPT DE FECHAMENTO DE VENDA
6. 🎁 SCRIPTS DE PÓS-VENDA:
   - Confirmação de compra
   - Acompanhamento da primeira semana
   - Solicitação de depoimento
   - Renovação/Upsell
7. 💡 DICAS FINAIS

Use emojis, formatação markdown e seja bem detalhado. Os scripts devem ser prontos para copiar e usar no WhatsApp.`;

    return await callGeminiAPI(prompt, AI_SYSTEM_PROMPTS.atendimento);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/members')}
            className="flex-shrink-0 -ml-2 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-white text-base md:text-lg">Analista de Atendimento</h1>
            <p className="text-xs text-white/50 truncate">Gere scripts personalizados de vendas</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <AtendimentoQuestionario onComplete={generateScripts} />
    </div>
  );
};

export default AnalistaAtendimento;
