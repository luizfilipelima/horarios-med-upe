import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { DaySchedule } from '../data/schedule';

interface DaySelectorProps {
  days: DaySchedule[];
  selectedId: string;
  onSelect: (id: string) => void;
  layoutId?: string;
}

export function DaySelector({ days, selectedId, onSelect, layoutId = 'day-pill' }: DaySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
    const el = containerRef.current?.querySelector(`[data-day="${id}"]`) as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      className=""
    >
      <div ref={containerRef} className="flex gap-2 overflow-x-auto pb-1">
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
