import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, MessageSquare, Copy, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface QuestionarioData {
  boasVindas: string;
  ofertaProduto: string;
  pitch: string;
  tipoProduto: string;
  valorProduto: string;
  objeccoes: string;
}

interface AtendimentoQuestionarioProps {
  onComplete: (data: QuestionarioData) => Promise<string>;
}

const QUESTIONS = [
  {
    id: 'boasVindas',
    title: 'Boas-vindas',
    description: 'Como você dá as boas-vindas ao seu lead?',
    placeholder: 'Ex: Olá! Seja muito bem-vindo(a)! Obrigado pelo interesse em...',
    field: 'boasVindas' as keyof QuestionarioData,
    type: 'textarea'
  },
  {
    id: 'tipoProduto',
    title: 'Tipo de Produto',
    description: 'Que tipo de produto/serviço você vende?',
    placeholder: 'Ex: Curso online, Mentoria, E-book...',
    field: 'tipoProduto' as keyof QuestionarioData,
    type: 'input'
  },
  {
    id: 'valorProduto',
    title: 'Valor Principal',
    description: 'Qual o benefício principal do seu produto?',
    placeholder: 'Ex: Ajuda a ganhar R$ 10.000/mês...',
    field: 'valorProduto' as keyof QuestionarioData,
    type: 'input'
  },
  {
    id: 'ofertaProduto',
    title: 'Apresentação',
    description: 'Como você apresenta o produto ao lead?',
    placeholder: 'Ex: Nós oferecemos um curso completo que ensina...',
    field: 'ofertaProduto' as keyof QuestionarioData,
    type: 'textarea'
  },
  {
    id: 'pitch',
    title: 'Pitch de Vendas',
    description: 'Qual é seu pitch para convencer o lead?',
    placeholder: 'Ex: Este produto vai transformar sua vida porque...',
    field: 'pitch' as keyof QuestionarioData,
    type: 'textarea'
  },
  {
    id: 'objeccoes',
    title: 'Objeções Comuns',
    description: 'Quais objeções seus leads costumam ter?',
    placeholder: 'Ex: Muito caro, Não tenho tempo, Já tentei antes...',
    field: 'objeccoes' as keyof QuestionarioData,
    type: 'input'
  }
];

export const AtendimentoQuestionario = ({ onComplete }: AtendimentoQuestionarioProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuestionarioData>({
    boasVindas: '',
    ofertaProduto: '',
    pitch: '',
    tipoProduto: '',
    valorProduto: '',
    objeccoes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  useEffect(() => {
    if (currentQuestion.type === 'input') {
      inputRef.current?.focus();
    } else {
      textareaRef.current?.focus();
    }
  }, [currentStep, currentQuestion.type]);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsGenerating(true);
    try {
      const result = await onComplete(data);
      setScripts(result);
      setCompleted(true);
    } catch (error) {
      console.error('Error generating scripts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateData = (field: keyof QuestionarioData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = data[currentQuestion.field].trim().length > 0;

  const copyScripts = () => {
    navigator.clipboard.writeText(scripts);
    toast({
      title: 'Copiado!',
      description: 'Scripts copiados para a área de transferência.'
    });
  };

  const resetForm = () => {
    setCompleted(false);
    setCurrentStep(0);
    setData({
      boasVindas: '',
      ofertaProduto: '',
      pitch: '',
      tipoProduto: '',
      valorProduto: '',
      objeccoes: ''
    });
    setScripts('');
  };

  if (completed) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-background/95 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <h1 className="font-bold text-white text-lg">Scripts Gerados!</h1>
              <p className="text-xs text-white/50">Personalizados para você</p>
            </div>
          </div>
        </div>

        {/* Scripts Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-white/80 text-sm md:text-base leading-relaxed">
                {scripts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-background/95 backdrop-blur-lg safe-area-bottom">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer
            </Button>
            <Button
              onClick={copyScripts}
              className="flex-1 h-12 bg-primary hover:bg-primary/90"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Tudo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-sm bg-white/5 border-white/10">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Gerando scripts...</h3>
                <p className="text-sm text-white/50">
                  Analisando suas respostas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Progress Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">
            Pergunta {currentStep + 1}/{QUESTIONS.length}
          </span>
          <span className="text-sm text-white/50">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="bg-white/5 border-white/10 max-w-lg mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg text-white">{currentQuestion.title}</CardTitle>
                <CardDescription className="text-white/50 mt-1">
                  {currentQuestion.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === 'input' ? (
              <Input
                ref={inputRef}
                value={data[currentQuestion.field]}
                onChange={(e) => updateData(currentQuestion.field, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canProceed) {
                    handleNext();
                  }
                }}
              />
            ) : (
              <Textarea
                ref={textareaRef}
                value={data[currentQuestion.field]}
                onChange={(e) => updateData(currentQuestion.field, e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={5}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base resize-none"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-background/95 backdrop-blur-lg safe-area-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 disabled:opacity-30"
          >
            {currentStep === QUESTIONS.length - 1 ? (
              <>
                Gerar Scripts
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
