import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';

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
    description: 'Como você dá as boas-vindas ao seu lead? Qual é a primeira mensagem que você envia?',
    placeholder: 'Ex: Olá! Seja muito bem-vindo(a)! Obrigado pelo interesse em...',
    field: 'boasVindas' as keyof QuestionarioData
  },
  {
    id: 'ofertaProduto',
    title: 'Demonstração do Produto',
    description: 'Como você demonstra ou apresenta o produto ao lead? Como você explica o que você oferece?',
    placeholder: 'Ex: Nós oferecemos um curso completo que ensina...',
    field: 'ofertaProduto' as keyof QuestionarioData
  },
  {
    id: 'pitch',
    title: 'Pitch de Vendas',
    description: 'Qual é o seu pitch? Como você convence o lead a comprar?',
    placeholder: 'Ex: Este produto vai transformar sua vida porque...',
    field: 'pitch' as keyof QuestionarioData
  },
  {
    id: 'tipoProduto',
    title: 'Tipo de Produto',
    description: 'Que tipo de produto ou serviço você está vendendo?',
    placeholder: 'Ex: Curso online, Mentoria, E-book, Software, Consultoria...',
    field: 'tipoProduto' as keyof QuestionarioData
  },
  {
    id: 'valorProduto',
    title: 'Valor do Produto',
    description: 'Qual é o valor/benefício principal que seu produto oferece?',
    placeholder: 'Ex: Ajuda a ganhar R$ 10.000/mês, Economiza 10h por semana...',
    field: 'valorProduto' as keyof QuestionarioData
  },
  {
    id: 'objeccoes',
    title: 'Objeções Comuns',
    description: 'Quais são as principais objeções ou dúvidas que seus leads costumam ter?',
    placeholder: 'Ex: Muito caro, Não tenho tempo, Já tentei antes e não funcionou...',
    field: 'objeccoes' as keyof QuestionarioData
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
    if (currentQuestion.id === 'tipoProduto' || currentQuestion.id === 'valorProduto' || currentQuestion.id === 'objeccoes') {
      inputRef.current?.focus();
    } else {
      textareaRef.current?.focus();
    }
  }, [currentStep, currentQuestion.id]);

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

  if (completed) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        <Card className="flex-1 overflow-y-auto m-4">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <CardTitle>Scripts Personalizados Gerados!</CardTitle>
            </div>
            <CardDescription>
              Aqui estão seus scripts de atendimento e pós-venda baseados nas suas respostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {scripts}
            </div>
            <div className="mt-6 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
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
                }}
              >
                Refazer Questionário
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(scripts);
                  alert('Scripts copiados para a área de transferência!');
                }}
              >
                Copiar Scripts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Gerando seus scripts...</h3>
                  <p className="text-sm text-muted-foreground">
                    Analisando suas respostas e criando scripts personalizados para você
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Pergunta {currentStep + 1} de {QUESTIONS.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>{currentQuestion.title}</CardTitle>
                <CardDescription className="mt-1">
                  {currentQuestion.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.id === 'tipoProduto' || currentQuestion.id === 'valorProduto' || currentQuestion.id === 'objeccoes' ? (
              <Input
                ref={inputRef}
                value={data[currentQuestion.field]}
                onChange={(e) => updateData(currentQuestion.field, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="text-base"
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
                rows={8}
                className="text-base resize-none"
              />
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


