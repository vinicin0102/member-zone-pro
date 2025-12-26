// Serviço de IA usando Google Gemini
// Para usar: adicione VITE_GEMINI_API_KEY no .env

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

export interface AIMessage {
    role: 'user' | 'model';
    content: string;
}

// Função principal para chamar a API do Gemini
export async function callGeminiAPI(
    prompt: string,
    systemPrompt?: string,
    history?: AIMessage[]
): Promise<string> {
    // Se não tiver API key, retorna resposta simulada
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ VITE_GEMINI_API_KEY não configurada. Usando resposta simulada.');
        return getSimulatedResponse(prompt, systemPrompt);
    }

    try {
        const contents = [];

        // Adicionar histórico de conversa se existir
        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                });
            }
        }

        // Adicionar mensagem atual
        const currentMessage = systemPrompt
            ? `${systemPrompt}\n\nUsuário: ${prompt}`
            : prompt;

        contents.push({
            role: 'user',
            parts: [{ text: currentMessage }]
        });

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API Error:', error);
            throw new Error(error.error?.message || 'Erro na API do Gemini');
        }

        const data: GeminiResponse = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Resposta inválida da API');
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Fallback para resposta simulada em caso de erro
        return getSimulatedResponse(prompt, systemPrompt);
    }
}

// Respostas simuladas para quando a API não está disponível
function getSimulatedResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // IA de Copy
    if (systemPrompt?.includes('copywriter') || systemPrompt?.includes('copy')) {
        if (lowerPrompt.includes('título') || lowerPrompt.includes('headline')) {
            return `📝 **Sugestões de Títulos:**

1. **"${prompt.slice(0, 50)}... - Descubra o Segredo"**
2. **"O Guia Definitivo: ${prompt.slice(0, 40)}..."**
3. **"Como [Resultado] em [Tempo] Usando ${prompt.slice(0, 30)}..."**

💡 **Dicas para títulos que convertem:**
- Use números (Ex: "7 Passos para...")
- Crie urgência (Ex: "Antes que acabe...")
- Prometa benefício claro
- Use palavras de poder (Grátis, Novo, Exclusivo)

Quer que eu crie mais variações?`;
        }

        return `✍️ **Copy Gerada:**

${prompt}

**Versão Otimizada para Conversão:**

"${prompt}"

🎯 **Elementos de Persuasão Usados:**
- ✓ Headline chamativa
- ✓ Benefícios claros
- ✓ Prova social
- ✓ Call-to-action forte

📱 **Adaptações sugeridas:**
- **Instagram:** Use emojis e quebre em parágrafos curtos
- **Facebook Ads:** Destaque o benefício principal na primeira linha
- **Email:** Personalize com o nome do lead

Posso ajustar o tom ou criar variações?`;
    }

    // IA Criativa
    if (systemPrompt?.includes('criativ') || systemPrompt?.includes('campanha')) {
        return `🎨 **Ideias Criativas para sua Campanha:**

Baseado na sua solicitação: "${prompt.slice(0, 100)}..."

**💡 Conceito Principal:**
Uma campanha que conecta emocionalmente com seu público através de storytelling visual.

**🎯 Direções Criativas:**

1. **Storytelling Emocional**
   - Mostre a transformação do cliente
   - Use depoimentos reais em vídeo curto

2. **Before & After**
   - Visualização clara dos resultados
   - Comparativo impactante

3. **User Generated Content**
   - Incentive clientes a criar conteúdo
   - Reposte as melhores histórias

**📱 Formatos Sugeridos:**
- Reels/TikTok (15-30 segundos)
- Carrossel (7-10 slides)
- Stories interativos

**🏷️ Hashtags:**
#Marketing #Resultados #Transformação #Sucesso

Quer que eu detalhe alguma dessas ideias?`;
    }

    // Analista de Campanha
    if (systemPrompt?.includes('analista') || systemPrompt?.includes('métricas')) {
        return `📊 **Análise da sua Campanha:**

Com base nas informações fornecidas, aqui está minha análise:

**📈 Métricas Identificadas:**
- CTR: Aparenta estar na média (1-2%)
- CPC: Custo por clique detectado
- CPM: Custo por mil impressões

**⚠️ Pontos de Atenção:**

1. **Otimização de Público**
   - Revise a segmentação
   - Teste públicos semelhantes
   - Exclua públicos de baixa conversão

2. **Criativos**
   - Faça testes A/B
   - Varie as chamadas para ação
   - Teste diferentes formatos

3. **Orçamento**
   - Redistribua para anúncios que performam
   - Pause os de baixo desempenho

**💡 Recomendações:**
1. Pausar anúncios com CTR < 1%
2. Aumentar budget nos que convertem
3. Criar variações dos melhores criativos

Envie um print do gerenciador para análise mais detalhada!`;
    }

    // Resposta genérica
    return `Olá! Recebi sua mensagem: "${prompt.slice(0, 100)}..."

Posso ajudar você com:
- 📝 Criação de copies persuasivas
- 🎨 Ideias criativas para campanhas
- 📊 Análise de performance de anúncios
- 💬 Scripts de atendimento

Como posso ajudar você hoje?`;
}

// Prompts do sistema para cada IA
export const AI_SYSTEM_PROMPTS = {
    copy: `Você é um especialista em copywriting e marketing digital. Seu papel é ajudar a criar textos persuasivos, títulos chamativos, CTAs efetivos e copies para diferentes canais (redes sociais, emails, landing pages, anúncios).

Diretrizes:
- Sempre forneça exemplos práticos
- Use gatilhos mentais apropriados
- Adapte o tom conforme o canal
- Sugira melhorias e variações
- Use formatação markdown para organizar
- Responda sempre em português brasileiro`,

    criativo: `Você é um diretor criativo especializado em campanhas digitais. Seu papel é gerar ideias criativas, conceitos visuais, estratégias de conteúdo e sugestões para campanhas de marketing.

Diretrizes:
- Seja criativo e inovador
- Sugira múltiplas direções
- Pense em diferentes formatos (vídeo, imagem, carrossel)
- Considere as tendências atuais
- Use formatação markdown para organizar
- Responda sempre em português brasileiro`,

    campanha: `Você é um analista de performance de mídia paga. Seu papel é analisar métricas de campanhas de anúncios (Facebook Ads, Google Ads, etc) e fornecer insights e recomendações de otimização.

Diretrizes:
- Analise CTR, CPC, CPM, ROAS e outras métricas
- Identifique problemas e oportunidades
- Sugira ações práticas de otimização
- Indique quais anúncios pausar ou escalar
- Use formatação markdown para organizar
- Responda sempre em português brasileiro`,

    atendimento: `Você é um especialista em atendimento e vendas. Seu papel é criar scripts de vendas, mensagens de boas-vindas, pitch de vendas, roteiros de follow-up e estratégias de pós-venda.

Diretrizes:
- Crie scripts personalizados e humanizados
- Inclua tratamento de objeções
- Sugira sequências de mensagens
- Use tom profissional mas acolhedor
- Use formatação markdown para organizar
- Responda sempre em português brasileiro`
};
