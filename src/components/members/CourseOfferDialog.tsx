import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

interface CourseOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  courseDescription?: string | null;
  videoEmbedCode?: string | null;
  purchaseUrl?: string | null;
  onPurchaseClick?: () => void;
}

export const CourseOfferDialog = ({
  open,
  onOpenChange,
  courseTitle,
  courseDescription,
  videoEmbedCode,
  purchaseUrl,
  onPurchaseClick
}: CourseOfferDialogProps) => {
  console.log('🎬 CourseOfferDialog renderizado:', {
    open,
    courseTitle,
    hasVideoEmbed: !!videoEmbedCode,
    hasPurchaseUrl: !!purchaseUrl,
    videoEmbedPreview: videoEmbedCode?.substring(0, 50)
  });

  const handlePurchase = () => {
    if (onPurchaseClick) {
      onPurchaseClick();
    } else if (purchaseUrl) {
      window.open(purchaseUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🎯 Desbloqueie {courseTitle}
          </DialogTitle>
          {courseDescription && (
            <DialogDescription className="text-center text-base pt-2">
              {courseDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Vídeo */}
          {videoEmbedCode ? (
            <div 
              className="relative w-full rounded-lg overflow-hidden"
              style={{ paddingBottom: '56.25%' }}
            >
              <div 
                className="absolute top-0 left-0 w-full h-full"
                dangerouslySetInnerHTML={{ __html: videoEmbedCode }}
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
              </div>
            </div>
          )}

          {/* Benefícios/Features */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg">O que você vai aprender:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Acesso completo a todo o conteúdo do curso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Suporte e acompanhamento exclusivo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Acesso vitalício ao material atualizado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Certificado de conclusão</span>
              </li>
            </ul>
          </div>

          {/* Botão de Compra */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full max-w-md text-lg py-6"
              onClick={handlePurchase}
            >
              🛒 Garantir Acesso Agora
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Pagamento seguro • Acesso liberado automaticamente após confirmação
            </p>
            <p className="text-xs text-muted-foreground/70 text-center max-w-md">
              ⚡ Entrega automática via webhook • Você receberá acesso assim que o pagamento for confirmado
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

