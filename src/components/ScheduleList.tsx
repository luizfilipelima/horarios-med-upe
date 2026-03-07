import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import type { ClassItem, DaySchedule } from '../data/schedule';
import { isClassForGroup } from '../data/schedule';
import { ClassCard } from './ClassCard';
import { FILTER_TODOS } from './GroupFilter';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { isClassActive, getClassHorarios, getTodayDayId } from '../utils/activeClass';

interface ScheduleListProps {
  day: DaySchedule;
  selectedGroupFilter: string;
  onCardClick?: (item: ClassItem) => void;
  /** Se true, faz auto-scroll para o card da aula atual ao montar ou quando mudar o dia */
  scrollToActive?: boolean;
  /** Direção do swipe: 'left' = próximo dia, 'right' = dia anterior */
  swipeDirection?: 'left' | 'right' | null;
  onSwipeAnimationComplete?: () => void;
}

const SWIPE_OFFSET = 24;

function filterClasses(day: DaySchedule, selectedGroupFilter: string): ClassItem[] {
  if (selectedGroupFilter === FILTER_TODOS) return day.classes;
  return day.classes.filter((c) => isClassForGroup(c.grupoAlvo, selectedGroupFilter));
}

export function ScheduleList({
  day,
  selectedGroupFilter,
  onCardClick,
  scrollToActive = true,
  swipeDirection = null,
  onSwipeAnimationComplete,
}: ScheduleListProps) {
  const dir = swipeDirection ?? 'left';
  const containerVariants = {
    hidden: {
      opacity: 0,
      x: dir === 'left' ? SWIPE_OFFSET : -SWIPE_OFFSET,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.22, ease: 'easeOut' as const },
    },
    exit: {
      opacity: 0,
      x: dir === 'left' ? -SWIPE_OFFSET : SWIPE_OFFSET,
      transition: { duration: 0.18, ease: 'easeOut' as const },
    },
  };
  const now = useCurrentTime();
  const activeCardRef = useRef<HTMLElement | null>(null);

  const filteredClasses = filterClasses(day, selectedGroupFilter);

  const activeIndex = filteredClasses.findIndex((cls) => {
    const { inicio, fim } = getClassHorarios(cls);
    return isClassActive(inicio, fim, day.id, now);
  });

  const isToday = day.id === getTodayDayId();
  const shouldScroll = scrollToActive && isToday && activeIndex >= 0;

  useEffect(() => {
    if (!shouldScroll) return;
    const scroll = () => {
      activeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const id = setTimeout(scroll, 350);
    return () => clearTimeout(id);
  }, [shouldScroll, activeIndex, day.id]);

  return (
    <AnimatePresence mode="wait" onExitComplete={onSwipeAnimationComplete}>
      <motion.div
        key={day.id}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="pb-4 flex flex-col gap-3"
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
          filteredClasses.map((cls, i) => {
            const { inicio, fim } = getClassHorarios(cls);
            const isActive = isClassActive(inicio, fim, day.id, now);
            return (
              <ClassCard
                key={`${day.id}-${cls.subject}-${cls.time}-${cls.location}-${i}`}
                item={cls}
                index={i}
                onClick={onCardClick ? () => onCardClick(cls) : undefined}
                isActive={isActive}
                innerRef={isActive ? activeCardRef : undefined}
              />
            );
          })
        )}
      </motion.div>
    </AnimatePresence>
  );
}
