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
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn('relative group/section', className)}>
      {/* Title */}
      {title && (
        <h2 className="netflix-row-title">
          {title}
        </h2>
      )}

      {/* Scroll container */}
      <div className="relative -mx-4 md:-mx-8 px-4 md:px-8">
        {/* Left navigation button */}
        {canScrollLeft && (
          <>
            {/* Gradient fade */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-[#0a0a0a] to-transparent" />

            {/* Button */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full items-center justify-start pl-2 
                opacity-0 group-hover/section:opacity-100 transition-all duration-200"
              aria-label="Scroll left"
            >
              <div className="p-2 rounded-full bg-black/80 hover:bg-black border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-sm">
                <ChevronLeft className="h-5 w-5 text-white" />
              </div>
            </button>
          </>
        )}

        {/* Right navigation button */}
        {canScrollRight && (
          <>
            {/* Gradient fade */}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-[#0a0a0a] to-transparent" />

            {/* Button */}
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full items-center justify-end pr-2
                opacity-0 group-hover/section:opacity-100 transition-all duration-200"
              aria-label="Scroll right"
            >
              <div className="p-2 rounded-full bg-black/80 hover:bg-black border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-sm">
                <ChevronRight className="h-5 w-5 text-white" />
              </div>
            </button>
          </>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="netflix-row-slider scrollbar-hide"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
