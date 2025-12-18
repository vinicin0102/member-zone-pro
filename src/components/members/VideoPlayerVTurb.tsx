import { cn } from '@/lib/utils';

interface VideoPlayerVTurbProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export const VideoPlayerVTurb = ({ videoUrl, title, className }: VideoPlayerVTurbProps) => {
  // Verifica se é código embed HTML completo ou apenas URL
  const isEmbedCode = videoUrl && (videoUrl.trim().startsWith('<iframe') || videoUrl.trim().startsWith('<embed') || videoUrl.includes('</iframe>'));

  if (isEmbedCode) {
    // Processa o código embed para garantir responsividade
    const processedEmbed = videoUrl
      .replace(/width="[^"]*"/gi, '')
      .replace(/height="[^"]*"/gi, '')
      .replace(/<iframe/gi, '<iframe class="absolute inset-0 w-full h-full" style="border: none;"');
    
    // Renderiza código embed diretamente
    return (
      <div className={cn('relative w-full', className)}>
        <div className="relative w-full rounded-xl overflow-hidden bg-secondary aspect-video">
          <div 
            className="absolute inset-0"
            dangerouslySetInnerHTML={{ __html: processedEmbed }}
          />
        </div>
      </div>
    );
  }

  // Se for URL, renderiza como iframe
  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative w-full rounded-xl overflow-hidden bg-secondary aspect-video">
        <iframe
          src={videoUrl}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
