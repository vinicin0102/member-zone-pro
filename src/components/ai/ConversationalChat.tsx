import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Send, Bot, User, ArrowLeft, Sparkles, RotateCcw, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isQuestion?: boolean;
    questionIndex?: number;
}

interface Question {
    id: string;
    question: string;
    placeholder: string;
    key: string;
}

interface ConversationalChatProps {
    title: string;
    description?: string;
    questions: Question[];
    welcomeMessage?: string;
    onGenerateResult: (answers: Record<string, string>) => Promise<string>;
    onBack?: () => void;
    aiName?: string;
    resultTitle?: string;
}

export const ConversationalChat = ({
    title,
    description,
    questions,
    welcomeMessage = 'Olá! Vou te ajudar. Vamos começar?',
    onGenerateResult,
    onBack,
    aiName = 'Assistente',
    resultTitle = 'Resultado'
}: ConversationalChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isGeneratingResult, setIsGeneratingResult] = useState(false);
    const [finalResult, setFinalResult] = useState<string>('');
    const [hasStarted, setHasStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    // Iniciar conversa
    const startConversation = () => {
        setHasStarted(true);

        // Mensagem de boas-vindas
        const welcomeMsg: Message = {
            id: 'welcome',
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date()
        };

        setMessages([welcomeMsg]);

        // Primeira pergunta após delay
        setTimeout(() => {
            askQuestion(0);
        }, 1000);
    };

    // Fazer uma pergunta
    const askQuestion = (index: number) => {
        if (index >= questions.length) {
            // Todas as perguntas respondidas, gerar resultado
            generateResult();
            return;
        }

        setCurrentQuestionIndex(index);
        const question = questions[index];

        const questionMsg: Message = {
            id: `question-${index}`,
            role: 'assistant',
            content: question.question,
            timestamp: new Date(),
            isQuestion: true,
            questionIndex: index
        };

        setMessages(prev => [...prev, questionMsg]);
        textareaRef.current?.focus();
    };

    // Responder pergunta
    const handleSendAnswer = async () => {
        if (!input.trim() || isLoading || currentQuestionIndex < 0) return;

        const userAnswer = input.trim();
        const currentQuestion = questions[currentQuestionIndex];

        // Salvar resposta
        setAnswers(prev => ({ ...prev, [currentQuestion.key]: userAnswer }));

        // Adicionar mensagem do usuário
        const userMsg: Message = {
            id: `answer-${currentQuestionIndex}`,
            role: 'user',
            content: userAnswer,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Pequeno delay antes da próxima pergunta (simula "pensando")
        setTimeout(() => {
            setIsLoading(false);

            // Feedback antes da próxima pergunta
            if (currentQuestionIndex < questions.length - 1) {
                const feedbacks = [
                    'Entendi! 👍',
                    'Perfeito! ✨',
                    'Ótimo! 💪',
                    'Legal! 🎯',
                    'Beleza! ✅'
                ];
                const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

                const feedbackMsg: Message = {
                    id: `feedback-${currentQuestionIndex}`,
                    role: 'assistant',
                    content: randomFeedback,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, feedbackMsg]);

                // Próxima pergunta após feedback
                setTimeout(() => {
                    askQuestion(currentQuestionIndex + 1);
                }, 600);
            } else {
                // Última pergunta respondida
                const finalFeedback: Message = {
                    id: 'final-feedback',
                    role: 'assistant',
                    content: 'Perfeito! Agora vou processar tudo e gerar seu resultado... 🚀',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, finalFeedback]);

                setTimeout(() => {
                    generateResult();
                }, 1000);
            }
        }, 500);
    };

    // Gerar resultado final
    const generateResult = async () => {
        setIsGeneratingResult(true);
        setCurrentQuestionIndex(-1);

        const generatingMsg: Message = {
            id: 'generating',
            role: 'assistant',
            content: '⏳ Gerando seu resultado personalizado...',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, generatingMsg]);

        try {
            // Incluir a última resposta
            const allAnswers = { ...answers };
            if (questions[questions.length - 1] && input.trim()) {
                allAnswers[questions[questions.length - 1].key] = input.trim();
            }

            const result = await onGenerateResult(allAnswers);
            setFinalResult(result);

            // Remover mensagem de "gerando" e adicionar resultado
            setMessages(prev => {
                const withoutGenerating = prev.filter(m => m.id !== 'generating');
                return [
                    ...withoutGenerating,
                    {
                        id: 'result',
                        role: 'assistant',
                        content: `✅ **${resultTitle}**\n\n${result}`,
                        timestamp: new Date()
                    }
                ];
            });
        } catch (error) {
            console.error('Error generating result:', error);
            setMessages(prev => {
                const withoutGenerating = prev.filter(m => m.id !== 'generating');
                return [
                    ...withoutGenerating,
                    {
                        id: 'error',
                        role: 'assistant',
                        content: '❌ Ops! Ocorreu um erro ao gerar o resultado. Tente novamente.',
                        timestamp: new Date()
                    }
                ];
            });
        } finally {
            setIsGeneratingResult(false);
        }
    };

    // Reiniciar conversa
    const resetConversation = () => {
        setMessages([]);
        setAnswers({});
        setCurrentQuestionIndex(-1);
        setFinalResult('');
        setHasStarted(false);
        setInput('');
    };

    // Copiar resultado
    const copyResult = () => {
        if (finalResult) {
            navigator.clipboard.writeText(finalResult);
            toast({
                title: 'Copiado!',
                description: 'Resultado copiado para a área de transferência.'
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendAnswer();
        }
    };

    const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0a0a0a]">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-white/10 bg-[#141414]/95 backdrop-blur-lg sticky top-0 z-50">
                <div className="flex items-center gap-3 px-4 py-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="flex-shrink-0 -ml-2 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="font-bold text-white text-base md:text-lg truncate">{title}</h1>
                            {description && (
                                <p className="text-xs text-white/50 truncate hidden sm:block">{description}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {finalResult && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={copyResult}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={resetConversation}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {hasStarted && currentQuestionIndex >= 0 && (
                    <div className="px-4 pb-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white/50">
                                Pergunta {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            <span className="text-xs text-white/50">
                                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                                className="netflix-progress-bar h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-3 md:px-4 py-4 space-y-4 max-w-3xl mx-auto">
                    {!hasStarted ? (
                        // Tela inicial
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                            <div className="p-5 rounded-2xl bg-white/5 mb-5 animate-float">
                                <Bot className="w-14 h-14 text-primary/70" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                                {title}
                            </h2>
                            <p className="text-sm text-white/50 max-w-sm mb-8">
                                {description || 'Vamos conversar para entender melhor suas necessidades e gerar o melhor resultado para você.'}
                            </p>
                            <Button
                                onClick={startConversation}
                                size="lg"
                                className="netflix-btn-primary gap-2 px-8"
                            >
                                <Sparkles className="w-4 h-4" />
                                Iniciar Conversa
                            </Button>

                            <div className="mt-8 text-xs text-white/30 max-w-xs">
                                💡 Responda às perguntas da IA e receba um resultado personalizado
                            </div>
                        </div>
                    ) : (
                        // Mensagens
                        messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex gap-2 md:gap-3 animate-fade-in',
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <Card
                                    className={cn(
                                        'max-w-[85%] md:max-w-[75%] p-3 md:p-4 shadow-lg border-0',
                                        message.role === 'user'
                                            ? 'bg-primary text-white rounded-2xl rounded-br-md'
                                            : 'bg-zinc-800/80 text-white rounded-2xl rounded-bl-md'
                                    )}
                                >
                                    <div className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                                        {message.content}
                                    </div>
                                    <p className="text-[10px] md:text-xs opacity-40 mt-2">
                                        {message.timestamp.toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </Card>
                                {message.role === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white/70" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-2 md:gap-3 justify-start animate-fade-in">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <Card className="bg-zinc-800/80 border-0 p-3 md:p-4 rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Generating indicator */}
                    {isGeneratingResult && (
                        <div className="flex gap-2 md:gap-3 justify-start animate-fade-in">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary animate-pulse" />
                            </div>
                            <Card className="bg-zinc-800/80 border-0 p-4 rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <span className="text-sm text-white/70">Gerando resultado...</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            {hasStarted && !finalResult && (
                <div className="flex-shrink-0 border-t border-white/10 bg-[#141414]/95 backdrop-blur-lg p-3 md:p-4 safe-area-bottom">
                    <div className="flex gap-2 max-w-3xl mx-auto">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={currentQuestion?.placeholder || 'Digite sua resposta...'}
                            disabled={isLoading || isGeneratingResult || currentQuestionIndex < 0}
                            rows={1}
                            className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-zinc-800/50 border-white/10 text-white placeholder:text-white/40 rounded-xl text-base focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                            style={{ paddingTop: '10px', paddingBottom: '10px' }}
                        />
                        <Button
                            onClick={handleSendAnswer}
                            disabled={!input.trim() || isLoading || isGeneratingResult || currentQuestionIndex < 0}
                            size="icon"
                            className="h-[44px] w-[44px] rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0 disabled:opacity-40"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Result Actions */}
            {finalResult && (
                <div className="flex-shrink-0 border-t border-white/10 bg-[#141414]/95 backdrop-blur-lg p-4 safe-area-bottom">
                    <div className="flex gap-3 max-w-3xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={resetConversation}
                            className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Nova Conversa
                        </Button>
                        <Button
                            onClick={copyResult}
                            className="flex-1 h-12 bg-primary hover:bg-primary/90"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Resultado
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
