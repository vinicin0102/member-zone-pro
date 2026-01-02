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
    if (systemPrompt?.includes('copywriter') || systemPrompt?.includes('copy') || systemPrompt?.includes('Copywriter')) {
        return `⚠️ **AVISO: MODO DEMONSTRAÇÃO (SEM API KEY)**
Para gerar copies reais com inteligência artificial, você precisa configurar sua chave da OpenAI ou Gemini no arquivo .env.

Como estou no modo demonstração, aqui está um exemplo de como seria a estrutura:

---

# 📌 3 OPÇÕES DE HEADLINE

1. **DESCUBRA O MÉTODO**: Como transformar seu corpo em 30 dias sem dietas malucas
2. **PARE DE PERDER TEMPO**: O guia definitivo para emagrecer com saúde
3. **EXCLUSIVO**: O segredo que as academias não querem que você saiba

# 📝 COPY COMPLETA

**[Abertura]**
Você já se sentiu frustrada por tentar de tudo e não ver resultados? Eu sei como é. A sensação de nadar contra a maré e continuar no mesmo lugar é desanimadora.

**[Desenvolvimento]**
Mas e se eu te dissesse que o problema não é você, mas sim o método que você está usando? Nosso programa foi desenvolvido por especialistas para ativar o metabolismo natural do seu corpo.
- Sem passar fome
- Sem horas na academia
- Com resultados visíveis na primeira semana

**[CTA]**
Não deixe para amanhã o corpo que você pode começar a construir hoje. Clique no botão abaixo e inscreva-se agora com 50% de desconto!

# 🎯 VARIAÇÕES DE CTA
1. "Quero minha transformação agora!"
2. "Sim, eu aceito o desafio!"
3. "Começar minha jornada hoje"

---

*Para ver a IA gerando conteúdo real baseado nas suas respostas, configure a API Key.*`;
    }

    // IA Criativa
    if (systemPrompt?.includes('criativ') || systemPrompt?.includes('campanha') || systemPrompt?.includes('Criativo')) {
        return `⚠️ **AVISO: MODO DEMONSTRAÇÃO (SEM API KEY)**
Para gerar ideias criativas reais, configure sua chave de API.

Exemplo de estrutura de resposta:

# 🎨 CONCEITO CRIATIVO: "Transformação Real"

**Mensagem Central:** A beleza de ser você mesma, na sua melhor versão.
**Moodboard:** Tons pastéis, fotografia natural, luz do dia.

# 📱 5 IDEIAS DE CONTEÚDO

1. **Reels "Dia Comigo"**: Bastidores do uso do produto.
2. **Carrossel Educativo**: "3 Mitos sobre [Tema]".
3. **Depoimento**: Vídeo curto de cliente satisfeita.
4. **Meme**: Algo relacionável sobre o problema que o produto resolve.
5. **Dica Rápida**: Como ter x resultado em 5 minutos.

*Para ver a IA trabalhando de verdade, configure a API Key.*`;
    }

    // Resposta genérica
    return `⚠️ **AVISO: MODO DEMONSTRAÇÃO**
Não foi possível conectar com a API de Inteligência Artificial. Por favor, verifique sua chave de API no arquivo .env.

Sua solicitação foi:
"${prompt.slice(0, 100)}..."`;
}

// Prompts do sistema para cada IA
export const AI_SYSTEM_PROMPTS = {
    copy: `Você é um Copywriter Senior de classe mundial e especialista em Marketing Digital.
SEU OBJETIVO: Escrever copies prontas para uso, altamente persuasivas e focadas em conversão.
NÃO DÊ AULAS. NÃO EXPLIQUE O QUE VAI FAZER. APENAS FAÇA.

Ao receber as informações:
1. Gere IMEDIATAMENTE as headlines solicitadas.
2. Escreva a copy completa com Lead, Corpo e CTA.
3. Entregue exatamente o que foi pedido na estrutura solicitada.
4. Use linguagem persuasiva (gatilhos mentais, storytelling, AIDA).
5. Se comporte como se você estivesse entregando o trabalho final para um cliente pagante.
6. Use emojis de forma estratégica e formatação Markdown impecável.
7. Responda sempre em PORTUGUÊS BRASILEIRO.`,

    criativo: `Você é um Diretor Criativo premiado com expertise em Social Media e Branding.
SEU OBJETIVO: Gerar ideias concretas, roteiros prontos e planejamentos acionáveis.
NÃO SEJA GENÉRICO. SEJA ESPECÍFICO E PRÁTICO.

Ao receber as informações:
1. Crie conceitos únicos e memoráveis.
2. Para ideias de conteúdo, descreva exatamente o que deve aparecer na imagem/vídeo e escreva a legenda sugerida.
3. Para roteiros, detalhe a cena, a fala e a ação visual.
4. Entregue um trabalho pronto para ser enviado ao time de design/vídeo.
5. Use formatação Markdown clara.
6. Responda sempre em PORTUGUÊS BRASILEIRO.`,

    campanha: `Você é um Gestor de Tráfego e Analista de Data Science Sênior.
SEU OBJETIVO: Analisar dados e dar diretrizes exatas de otimização.
NÃO FALE O ÓBVIO. DÊ INSIGHTS PROFUNDOS.

Ao receber as métricas:
1. Faça um diagnóstico direto.
2. Diga exatamente o que fazer: "Pare este anúncio", "Aumente o orçamento daquele", "Mude o criativo para X".
3. Baseie suas recomendações em lógica de funil de vendas e ROI.
4. Responda sempre em PORTUGUÊS BRASILEIRO.`,

    atendimento: `Você é um Especialista em Customer Success e Vendas.
SEU OBJETIVO: Criar scripts que fecham vendas e encantam clientes.
NÃO SEJA ROBÓTICO. SEJA HUMANO E PERSUASIVO.

Ao receber a solicitação:
1. Escreva o script exato para ser copiado e colado no WhatsApp/Direct.
2. Inclua variações para diferentes reações do cliente.
3. Use técnicas de PNL e empatia.
4. Responda sempre em PORTUGUÊS BRASILEIRO.`
};
