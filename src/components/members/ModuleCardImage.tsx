import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardImageProps {
  title: string;
  imageUrl?: string | null;
  progress?: number;
  isLocked?: boolean;
  isPremium?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ModuleCardImage = ({
  title,
  imageUrl,
  progress = 0,
  isLocked = false,
  isPremium = false,
  className,
  onClick
}: ModuleCardImageProps) => {
  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[300px] h-[200px] rounded-xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      {/* Background Image ou placeholder */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40',
          imageUrl ? 'bg-cover bg-center' : 'bg-primary/10',
          isLocked && 'grayscale' // Aplicar grayscale quando bloqueado
        )}
        style={imageUrl ? { 
          backgroundImage: `url(${imageUrl})`,
          filter: isLocked ? 'grayscale(100%)' : 'none' // Garantir grayscale nas imagens
        } : {}}
      >
        {/* Overlay escuro */}
        <div className={cn(
          'absolute inset-0 transition-colors',
          isLocked ? 'bg-black/60' : 'bg-black/40 group-hover:bg-black/30'
        )} />
      </div>

      {/* Indicador de progresso */}
      {!isLocked && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-semibold">
          {progress}%
        </div>
      )}

      {/* Ícone de cadeado para premium */}
      {isLocked && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm p-2 rounded-full">
          <Lock className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Título na parte inferior - estilo grande e destacado */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <h3 className="text-white font-bold text-xl leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{title}</h3>
      </div>
    </div>
  );
};

