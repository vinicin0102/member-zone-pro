import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AtendimentoQuestionario, type QuestionarioData } from '@/components/ai/AtendimentoQuestionario';

const AnalistaAtendimento = () => {
  const navigate = useNavigate();

  const generateScripts = async (data: QuestionarioData): Promise<string> => {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Gerar scripts personalizados baseados nas respostas
    let scripts = `🎯 **SCRIPTS PERSONALIZADOS DE ATENDIMENTO**\n\n`;
    scripts += `Gerados especialmente para você baseado nas suas respostas!\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Script de Boas-vindas
    scripts += `👋 **SCRIPT DE BOAS-VINDAS**\n\n`;
    scripts += `${data.boasVindas}\n\n`;
    scripts += `**Versão Otimizada:**\n`;
    scripts += `${data.boasVindas} É um prazer ter você aqui! 🎉\n\n`;
    scripts += `**Dica:** Sempre personalize com o nome do lead quando possível!\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Script de Apresentação do Produto
    scripts += `📦 **SCRIPT DE APRESENTAÇÃO DO PRODUTO**\n\n`;
    scripts += `**Produto:** ${data.tipoProduto}\n`;
    scripts += `**Valor Principal:** ${data.valorProduto}\n\n`;
    scripts += `**Apresentação:**\n`;
    scripts += `${data.ofertaProduto}\n\n`;
    scripts += `**Versão Estruturada para Vendas:**\n\n`;
    scripts += `"Olá [Nome]!\n\n`;
    scripts += `${data.ofertaProduto}\n\n`;
    scripts += `O que torna isso único é que você vai ${data.valorProduto}\n\n`;
    scripts += `É exatamente por isso que nossos clientes têm obtido resultados incríveis!"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Script de Pitch
    scripts += `🎤 **SCRIPT DE PITCH DE VENDAS**\n\n`;
    scripts += `${data.pitch}\n\n`;
    scripts += `**Versão Aprimorada com CTA:**\n\n`;
    scripts += `${data.pitch}\n\n`;
    scripts += `Agora, imagine você tendo acesso a tudo isso e começando a ver resultados já nas primeiras semanas...\n\n`;
    scripts += `É exatamente isso que você vai conquistar com nosso ${data.tipoProduto}.\n\n`;
    scripts += `**Chamada para Ação:**\n`;
    scripts += `"Quer saber como você pode começar hoje mesmo? Vou te mostrar o caminho completo!"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Scripts para Objeções
    scripts += `🛡️ **SCRIPTS PARA OBJEÇÕES**\n\n`;
    if (data.objeccoes.trim()) {
      const objeccoes = data.objeccoes.split(',').map(o => o.trim()).filter(Boolean);
      objeccoes.forEach((obj, index) => {
        scripts += `**Objeção ${index + 1}: "${obj}"**\n\n`;
        scripts += `**Resposta Sugerida:**\n`;
        
        const objLower = obj.toLowerCase();
        if (objLower.includes('caro') || objLower.includes('preço') || objLower.includes('custo')) {
          scripts += `"Entendo completamente sua preocupação com o investimento. E é exatamente por isso que precisamos falar sobre o valor real.\n\n`;
          scripts += `Quando você pensa em ${data.valorProduto}, qual seria o retorno ideal para você?\n\n`;
          scripts += `O investimento neste ${data.tipoProduto} é de apenas R$ X (ou adapte ao seu valor), mas o retorno pode ser muito maior. Vou te mostrar exatamente como..."\n\n`;
        } else if (objLower.includes('tempo')) {
          scripts += `"Perfeito! E por isso mesmo que nosso método foi desenvolvido para pessoas como você.\n\n`;
          scripts += `${data.valorProduto}\n\n`;
          scripts += `Você vai investir apenas X horas por semana (adaptar) e terá acesso a todo o suporte necessário. Quer ver como funciona na prática?"\n\n`;
        } else if (objLower.includes('tentei') || objLower.includes('não funcionou') || objLower.includes('ja tentei')) {
          scripts += `"Compreendo perfeitamente! E é exatamente por isso que nosso método é diferente.\n\n`;
          scripts += `O que faz a diferença aqui é [destacar diferenciais do seu produto].\n\n`;
          scripts += `Vou te mostrar como isso é diferente do que você já tentou antes..."\n\n`;
        } else {
          scripts += `"Essa é uma dúvida muito comum! Deixe-me esclarecer isso para você.\n\n`;
          scripts += `${data.pitch}\n\n`;
          scripts += `Posso te mostrar exatamente como isso funciona e tirar todas as suas dúvidas. Que tal conversarmos mais?"\n\n`;
        }
        scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      });
    }

    // Script de Fechamento
    scripts += `✅ **SCRIPT DE FECHAMENTO DE VENDA**\n\n`;
    scripts += `"Então [Nome], baseado em tudo que conversamos:\n\n`;
    scripts += `✓ Você precisa de ${data.valorProduto}\n`;
    scripts += `✓ Nosso ${data.tipoProduto} oferece exatamente isso\n`;
    scripts += `✓ Você está pronto para começar a ver resultados\n\n`;
    scripts += `A única pergunta que resta é: quando você quer começar?\n\n`;
    scripts += `Temos uma condição especial para você que está decidindo agora. Quer que eu te mostre?"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Scripts de Pós-Venda
    scripts += `🎁 **SCRIPTS DE PÓS-VENDA**\n\n`;
    
    scripts += `**1. Confirmação de Compra (Imediato)**\n\n`;
    scripts += `"Olá [Nome]! 🎉\n\n`;
    scripts += `Acabamos de confirmar seu pedido do ${data.tipoProduto}!\n\n`;
    scripts += `Estamos muito felizes em ter você conosco. Você vai receber todas as informações de acesso em até 24 horas.\n\n`;
    scripts += `Enquanto isso, quero te dar as boas-vindas pessoalmente! ${data.boasVindas}\n\n`;
    scripts += `Qualquer dúvida, estou aqui para ajudar! 😊"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    scripts += `**2. Primeira Semana de Acompanhamento**\n\n`;
    scripts += `"Olá [Nome]! 👋\n\n`;
    scripts += `Como está sendo sua experiência com o ${data.tipoProduto} até agora?\n\n`;
    scripts += `Queremos garantir que você esteja aproveitando ao máximo tudo que oferecemos.\n\n`;
    scripts += `Se precisar de ajuda, orientação ou tiver alguma dúvida, estou aqui para você!\n\n`;
    scripts += `Como está indo por aí? 😊"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    scripts += `**3. Solicitação de Depoimento (Após resultados)**\n\n`;
    scripts += `"Olá [Nome]! 👋\n\n`;
    scripts += `Notei que você já está usando nosso ${data.tipoProduto} há algum tempo.\n\n`;
    scripts += `Como está sendo sua experiência? Já conseguiu ${data.valorProduto}?\n\n`;
    scripts += `Adoraríamos ouvir seu feedback e, se você estiver satisfeito, seria incrível se pudesse compartilhar sua experiência conosco!\n\n`;
    scripts += `Sua opinião é muito importante para nós! 💙"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    scripts += `**4. Renovação/Upsell (Antes do vencimento)**\n\n`;
    scripts += `"Olá [Nome]! 👋\n\n`;
    scripts += `Seu acesso ao ${data.tipoProduto} está próximo do vencimento.\n\n`;
    scripts += `Você já conseguiu ${data.valorProduto}? Como está sendo sua jornada?\n\n`;
    scripts += `Temos uma condição especial para você continuar conosco e manter seus resultados. Quer saber mais?\n\n`;
    scripts += `É uma oportunidade imperdível! 😊"\n\n`;
    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Dicas Finais
    scripts += `💡 **DICAS FINAIS**\n\n`;
    scripts += `✅ Sempre personalize com o nome do cliente\n`;
    scripts += `✅ Use emojis com moderação (2-3 por mensagem)\n`;
    scripts += `✅ Responda rápido (dentro de 1-2 horas no horário comercial)\n`;
    scripts += `✅ Seja autêntico e use sua própria voz\n`;
    scripts += `✅ Faça perguntas para engajar o lead\n`;
    scripts += `✅ Crie urgência, mas seja honesto\n`;
    scripts += `✅ Sempre ofereça valor antes de vender\n\n`;

    scripts += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    scripts += `✨ **Boa sorte com suas vendas!** ✨\n`;

    return scripts;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-lg">Analista de Atendimento</h1>
            <p className="text-xs text-muted-foreground">Questionário para gerar scripts personalizados</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <AtendimentoQuestionario onComplete={generateScripts} />
      </div>
    </div>
  );
};

export default AnalistaAtendimento;

