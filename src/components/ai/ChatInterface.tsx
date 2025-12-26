import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  title: string;
  description?: string;
  placeholder?: string;
  onSendMessage: (message: string) => Promise<string>;
  initialMessages?: Message[];
  onBack?: () => void;
}

export const ChatInterface = ({
  title,
  description,
  placeholder = 'Digite sua mensagem...',
  onSendMessage,
  initialMessages = [],
  onBack
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await onSendMessage(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 border-b border-white/10 bg-background/95 backdrop-blur-lg sticky top-0 z-50">
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
        </div>
      </header>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 md:px-4 py-4 space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <div className="p-4 rounded-2xl bg-white/5 mb-4">
                <Bot className="w-12 h-12 text-primary/60" />
              </div>
              <p className="text-lg font-medium text-white/80">Olá! Como posso ajudar?</p>
              <p className="text-sm text-white/40 mt-2 max-w-xs">{description || 'Faça uma pergunta para começar'}</p>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-sm">
                {['Criar um título', 'Escrever copy', 'Gerar ideias'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors border border-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2 md:gap-3 animate-fade-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <Card
                  className={cn(
                    'max-w-[85%] md:max-w-[75%] p-3 md:p-4 shadow-lg',
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-2xl rounded-br-md'
                      : 'bg-white/5 border-white/10 text-white rounded-2xl rounded-bl-md'
                  )}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-[10px] md:text-xs opacity-50 mt-2">
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
              <Card className="bg-white/5 border-white/10 p-3 md:p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-white/60">Pensando...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-white/10 bg-background/95 backdrop-blur-lg p-3 md:p-4 safe-area-bottom">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl text-base"
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
