import { AnimatePresence, motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import type { DaySchedule } from '../data/schedule';
import { ClassCard } from './ClassCard';

interface ScheduleListProps {
  day: DaySchedule;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, x: -12, transition: { duration: 0.18 } },
};

export function ScheduleList({ day }: ScheduleListProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={day.id}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="px-5 pb-10 flex flex-col gap-3"
      >
        {day.classes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400"
          >
            <CalendarX size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium">Nenhuma aula neste dia</p>
          </motion.div>
        ) : (
          day.classes.map((cls, i) => (
            <ClassCard key={`${day.id}-${i}`} item={cls} index={i} />
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
}
