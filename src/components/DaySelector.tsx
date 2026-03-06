import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DaySchedule } from '../data/schedule';

interface DaySelectorProps {
  days: DaySchedule[];
  selectedId: string;
  onSelect: (id: string) => void;
  layoutId?: string;
}

const ARROW_ZONE = 47; // área das setas e gradiente (px)

export function DaySelector({ days, selectedId, onSelect, layoutId = 'day-pill' }: DaySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, days.length]);

  const scrollToCenter = useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => {
      const el = containerRef.current?.querySelector(`[data-day="${id}"]`) as HTMLElement;
      el?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
    },
    []
  );

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  useEffect(() => {
    if (!selectedId || days.length === 0) return;
    const timer = requestAnimationFrame(() => {
      scrollToCenter(selectedId, 'auto');
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    scrollToCenter(selectedId);
  }, [selectedId, scrollToCenter]);

  const goToAdjacentDay = (direction: 'left' | 'right') => {
    const idx = days.findIndex((d) => d.id === selectedId);
    if (idx < 0) return;
    const nextIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= days.length) return;
    onSelect(days[nextIdx].id);
  };

  const showLeftFade = canScrollLeft;
  const showRightFade = canScrollRight;

  const fadeMask =
    showLeftFade || showRightFade
      ? {
          maskImage: `linear-gradient(to right, ${showLeftFade ? `transparent 0px, black ${ARROW_ZONE}px` : 'black 0px'}, black ${showRightFade ? `calc(100% - ${ARROW_ZONE}px), transparent 100%` : '100%'})`,
          WebkitMaskImage: `linear-gradient(to right, ${showLeftFade ? `transparent 0px, black ${ARROW_ZONE}px` : 'black 0px'}, black ${showRightFade ? `calc(100% - ${ARROW_ZONE}px), transparent 100%` : '100%'})`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }
      : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      className="relative flex w-full items-center"
    >
      {/* Setas — absolute, z-20, feedback apenas por scale (sem top/translate no clique) */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            type="button"
            onClick={() => goToAdjacentDay('left')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ opacity: 0.8 }}
            className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 border border-black/5 text-gray-700 dark:bg-white/10 dark:border-white/5 dark:text-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Dias anteriores"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            type="button"
            onClick={() => goToAdjacentDay('right')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ opacity: 0.8 }}
            className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 border border-black/5 text-gray-700 dark:bg-white/10 dark:border-white/5 dark:text-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Próximos dias"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradientes de fade — nunca no primeiro dia (esquerda) nem no último (direita) */}
      {showLeftFade && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-14 bg-gradient-to-r from-[#f8f7f5] to-transparent dark:from-zinc-950"
          aria-hidden
        />
      )}
      {showRightFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-14 bg-gradient-to-l from-[#f8f7f5] to-transparent dark:from-zinc-950"
          aria-hidden
        />
      )}

      {/* Contêiner de scroll — inseta com mx para não ter dias atrás das setas */}
      <div
        ref={containerRef}
        className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden py-1 scroll-smooth"
        style={{
          marginLeft: ARROW_ZONE,
          marginRight: ARROW_ZONE,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollPaddingInline: `${ARROW_ZONE}px`,
          ...fadeMask,
        }}
      >
        {days.map((day) => {
          const isSelected = day.id === selectedId;
          return (
            <button
              key={day.id}
              data-day={day.id}
              onClick={() => handleSelect(day.id)}
              className={`
                relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold
                transition-colors duration-200 focus:outline-none
                ${isSelected
                  ? 'text-white'
                  : 'text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }
              `}
            >
              {isSelected && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-full bg-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-950"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{day.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
