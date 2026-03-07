import { AnimatePresence, motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import type { ClassItem, DaySchedule } from '../data/schedule';
import { GRUPO_TODOS } from '../data/schedule';
import { ClassCard } from './ClassCard';
import { FILTER_TODOS } from './GroupFilter';

interface ScheduleListProps {
  day: DaySchedule;
  selectedGroupFilter: string;
  onCardClick?: (item: ClassItem) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, x: -12, transition: { duration: 0.18 } },
};

function filterClasses(day: DaySchedule, selectedGroupFilter: string) {
  if (selectedGroupFilter === FILTER_TODOS) return day.classes;
  return day.classes.filter(
    (c) => c.grupoAlvo === GRUPO_TODOS || c.grupoAlvo === selectedGroupFilter
  );
}

export function ScheduleList({ day, selectedGroupFilter, onCardClick }: ScheduleListProps) {
  const filteredClasses = filterClasses(day, selectedGroupFilter);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={day.id}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="pb-10 flex flex-col gap-3"
      >
        {filteredClasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400 dark:text-zinc-600"
          >
            <CalendarX size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium">Nenhuma aula neste dia</p>
          </motion.div>
        ) : (
          filteredClasses.map((cls, i) => (
            <ClassCard
              key={`${day.id}-${cls.subject}-${cls.time}-${cls.location}-${i}`}
              item={cls}
              index={i}
              onClick={onCardClick ? () => onCardClick(cls) : undefined}
            />
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
}
