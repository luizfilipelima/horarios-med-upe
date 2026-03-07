import { useRef } from 'react';
import { motion } from 'framer-motion';

const FILTER_TODOS = 'TODOS';

interface GroupFilterProps {
  groups: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function GroupFilter({ groups, selected, onSelect }: GroupFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const options = [FILTER_TODOS, ...groups];

  const handleSelect = (value: string) => {
    onSelect(value);
    if (value !== FILTER_TODOS) {
      const el = containerRef.current?.querySelector(`[data-filter="${value}"]`) as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className=""
    >
      <div ref={containerRef} className="flex gap-1.5 overflow-x-auto pb-1">
        {options.map((value) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              data-filter={value}
              type="button"
              onClick={() => handleSelect(value)}
              className={`
                relative flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold
                ${value === FILTER_TODOS ? 'sticky left-0 z-10 bg-white dark:bg-zinc-900' : ''}
                transition-colors duration-200 focus:outline-none
                ${isSelected
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }
              `}
            >
              {isSelected && (
                <motion.span
                  layoutId="group-filter-pill"
                  className="absolute inset-0 rounded-full bg-indigo-500 shadow-sm dark:shadow-indigo-950/50"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                {value === FILTER_TODOS ? 'TODOS' : value}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export { FILTER_TODOS };
