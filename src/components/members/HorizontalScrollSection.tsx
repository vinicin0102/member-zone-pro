import { ReactNode, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HorizontalScrollSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const HorizontalScrollSection = ({ title, children, className }: HorizontalScrollSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        ref.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn('netflix-row relative group/row', className)}>
      {/* Title with animated underline */}
      {title && (
        <div className="flex items-center gap-3 mb-4 px-2 md:px-4">
          <h2 className="netflix-row-title text-lg md:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
            <span>Ver tudo</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-30 h-full px-2 md:px-4',
          'flex items-center justify-center',
          'bg-gradient-to-r from-background via-background/80 to-transparent',
          'opacity-0 group-hover/row:opacity-100 transition-opacity duration-300',
          'disabled:opacity-0 disabled:cursor-default',
          title ? 'pt-12' : ''
        )}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <div className={cn(
          'p-2 rounded-full',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'hover:bg-white/20 hover:scale-110 transition-all duration-200',
          !canScrollLeft && 'opacity-0'
        )}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </div>
      </button>

      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-30 h-full px-2 md:px-4',
          'flex items-center justify-center',
          'bg-gradient-to-l from-background via-background/80 to-transparent',
          'opacity-0 group-hover/row:opacity-100 transition-opacity duration-300',
          'disabled:opacity-0 disabled:cursor-default',
          title ? 'pt-12' : ''
        )}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <div className={cn(
          'p-2 rounded-full',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'hover:bg-white/20 hover:scale-110 transition-all duration-200',
          !canScrollRight && 'opacity-0'
        )}>
          <ChevronRight className="h-6 w-6 text-white" />
        </div>
      </button>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          'netflix-row-slider flex gap-2 md:gap-4 overflow-x-auto pb-4 px-2 md:px-4',
          '-mx-2 md:-mx-4'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
