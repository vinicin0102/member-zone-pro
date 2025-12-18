import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterfaceWithImage } from '@/components/ai/ChatInterfaceWithImage';

const AnalistaCampanha = () => {
  const navigate = useNavigate();

  const analyzeImage = async (imageFile: File): Promise<string> => {
    // Simular análise de imagem (aqui você pode integrar com OCR + IA visual)
    // Por enquanto, retorna análise simulada baseada em padrões comuns
    
    // TODO: Integrar com:
    // 1. OCR para extrair textos e números dos prints
    // 2. Vision API (OpenAI GPT-4 Vision, Google Vision, etc.) para análise visual
    // 3. Análise de métricas específicas de plataformas (Meta Ads, Google Ads, etc.)
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Análise simulada - em produção, isso viria da API
    return `📊 **Análise do Print Enviado:**\n\nDetectei métricas no seu gerenciador de anúncios. Aqui está minha análise:\n\n`;
  };

  const handleSendMessage = async (message: string, images?: File[]): Promise<string> => {
    // Se há imagens, analisar primeiro
    if (images && images.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let analysis = '';
      
      // Analisar cada imagem
      for (const image of images) {
        const imageAnalysis = await analyzeImage(image);
        analysis += imageAnalysis;
      }
      
      // Análise completa baseada nas imagens
      analysis += `\n✅ **Performance Geral:**\n\n`;
      analysis += `**Impressões:** Detectadas no print\n`;
      analysis += `**Cliques:** Detectados no print\n`;
      analysis += `**CTR:** Calculado\n`;
      analysis += `**CPC:** Detectado no print\n`;
      analysis += `**Investimento:** Detectado no print\n\n`;
      
      analysis += `⚠️ **Problemas Identificados:**\n\n`;
      analysis += `1. **Alto CPC:** Alguns anúncios estão com custo por clique acima do ideal\n`;
      analysis += `   💡 **Ação:** Pausar anúncios com CPC > R$ X,XX (ajustar threshold)\n\n`;
      analysis += `2. **Baixo CTR:** Alguns anúncios têm taxa de cliques baixa\n`;
      analysis += `   💡 **Ação:** Testar novos criativos ou ajustar segmentação\n\n`;
      analysis += `3. **Alto CPM:** Custo por mil impressões pode ser otimizado\n`;
      analysis += `   💡 **Ação:** Refinar público-alvo ou ajustar lances\n\n`;
      
      analysis += `🎯 **Recomendações Imediatas:**\n\n`;
      analysis += `1. **Desativar anúncios com baixa performance:**\n`;
      analysis += `   - Identifique anúncios com CTR < 1% ou CPC muito alto\n`;
      analysis += `   - Pause temporariamente para reduzir desperdício\n\n`;
      analysis += `2. **Aumentar orçamento nos anúncios que performam bem:**\n`;
      analysis += `   - Redirecione o orçamento dos anúncios pausados\n`;
      analysis += `   - Dê mais visibilidade aos que convertem melhor\n\n`;
      analysis += `3. **Otimizar criativos:**\n`;
      analysis += `   - Teste variações dos anúncios que estão performando\n`;
      analysis += `   - Use os mesmos elementos visuais dos melhores resultados\n\n`;
      
      analysis += `📈 **Próximos Passos:**\n\n`;
      analysis += `- Monitorar performance nas próximas 24-48h após ajustes\n`;
      analysis += `- Fazer novos testes de público e criativos\n`;
      analysis += `- Enviar outro print em alguns dias para reanálise\n\n`;
      
      analysis += `Quer que eu detalhe alguma métrica específica ou tenha dúvidas sobre como fazer os ajustes?`;
      
      return analysis;
    }
    
    // Se não há imagem, responder normalmente
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('como') && (lowerMessage.includes('desativar') || lowerMessage.includes('pausar'))) {
      return `⏸️ **Como Desativar Anúncios no Gerenciador:**\n\n**Meta Ads (Facebook/Instagram):**\n1. Acesse o Gerenciador de Anúncios\n2. Vá em "Anúncios" ou "Campanhas"\n3. Selecione os anúncios que quer pausar\n4. Clique em "Desativar" ou use o toggle\n\n**Google Ads:**\n1. Acesse sua conta do Google Ads\n2. Vá na aba "Anúncios e extensões"\n3. Selecione os anúncios\n4. Clique em "Alterar status" > "Pausar"\n\n💡 **Dica:** Sempre pause (não exclua) para manter histórico de dados!\n\nEnvie um print se quiser ajuda específica para identificar quais desativar.`;
    }
    
    if (lowerMessage.includes('otimizar') || lowerMessage.includes('melhorar')) {
      return `🚀 **Dicas de Otimização:**\n\n1. **Teste A/B constantemente:**\n   - Compare diferentes criativos\n   - Teste públicos diferentes\n   - Experimente CTAs variados\n\n2. **Use os Dados:**\n   - Aumente orçamento nos anúncios que performam\n   - Reduza ou pause os de baixa performance\n   - Replique elementos dos anúncios vencedores\n\n3. **Segmentação:**\n   - Afine o público-alvo baseado nos dados\n   - Crie públicos similares aos que convertem\n   - Use remarketing\n\n4. **Horários:**\n   - Identifique quando seu público está mais ativo\n   - Ajuste horários de publicação\n\nEnvie um print da sua campanha para análise detalhada!`;
    }
    
    return `Olá! Sou seu Analista de Campanhas. Envie um print do seu gerenciador de anúncios (Meta Ads, Google Ads, etc.) e eu vou:\n\n📊 Analisar a performance dos seus anúncios\n⚠️ Identificar problemas e gargalos\n💡 Sugerir otimizações específicas\n⏸️ Ajudar a identificar quais anúncios desativar\n💰 Otimizar custos e ROI\n\n**Como usar:**\n1. Tire um print da tela do seu gerenciador\n2. Clique no ícone de imagem abaixo\n3. Faça upload do print\n4. Aguarde minha análise detalhada!\n\nTambém posso ajudar com perguntas sobre estratégia e otimização.`;
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
        <ChatInterfaceWithImage
          title="Analista de Campanha"
          description="Envie prints do seu gerenciador de anúncios para análise detalhada e recomendações de otimização"
          placeholder="Ou digite uma pergunta sobre sua campanha..."
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default AnalistaCampanha;

