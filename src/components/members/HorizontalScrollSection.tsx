import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
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
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure children are rendered
    const timer = setTimeout(checkScrollButtons, 100);

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollButtons, { passive: true });
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      clearTimeout(timer);
      if (ref) {
        ref.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Title */}
      {title && (
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 px-4">
          {title}
        </h2>
      )}

      {/* Scroll container */}
      <div className="relative">
        {/* Left gradient + button (desktop only) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-background to-transparent"
            aria-label="Scroll left"
          >
            <div className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronLeft className="h-5 w-5 text-white" />
            </div>
          </button>
        )}

        {/* Right gradient + button (desktop only) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-background to-transparent"
            aria-label="Scroll right"
          >
            <div className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
