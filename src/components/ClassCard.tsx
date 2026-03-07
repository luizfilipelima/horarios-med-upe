import { motion } from 'framer-motion';
import { Clock, MapPin, User, Users, Wifi, FlaskConical, BookOpen, Stethoscope } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';
import { GRUPO_TODOS } from '../data/schedule';

interface ClassCardProps {
  item: ClassItem;
  index: number;
  onClick?: () => void;
}

interface TypeConfig {
  label: string;
  bg: string;
  border: string;
  tag: string;
  tagText: string;
  icon: React.ReactNode;
}

const typeConfig: Record<ClassType, TypeConfig> = {
  teoria: {
    label: 'Teoria',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200 dark:border-sky-500/20',
    tag: 'bg-sky-100 dark:bg-sky-500/20',
    tagText: 'text-sky-800 dark:text-sky-400',
    icon: <BookOpen size={12} strokeWidth={2.5} />,
  },
  simulacion: {
    label: 'Simulación',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/20',
    tag: 'bg-violet-100 dark:bg-violet-500/20',
    tagText: 'text-violet-800 dark:text-violet-400',
    icon: <FlaskConical size={12} strokeWidth={2.5} />,
  },
  virtual: {
    label: 'Virtual',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    tag: 'bg-emerald-100 dark:bg-emerald-500/20',
    tagText: 'text-emerald-800 dark:text-emerald-400',
    icon: <Wifi size={12} strokeWidth={2.5} />,
  },
  practica: {
    label: 'Prática',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    tag: 'bg-amber-100 dark:bg-amber-500/20',
    tagText: 'text-amber-800 dark:text-amber-400',
    icon: <Stethoscope size={12} strokeWidth={2.5} />,
  },
};

const cardVariants: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.38,
      ease: 'easeOut' as const,
    },
  }),
};

export function ClassCard({ item, index, onClick }: ClassCardProps) {
  const config = typeConfig[item.type];

  const baseProps = {
    layout: true as const,
    custom: index,
    variants: cardVariants,
    initial: 'hidden' as const,
    animate: 'visible' as const,
    transition: { layout: { type: 'spring' as const, stiffness: 350, damping: 30 } },
    className: `rounded-3xl border p-5 ${config.bg} ${config.border} flex flex-col gap-3 text-left w-full`,
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 leading-tight flex-1 min-w-0">
          {item.subject}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {item.grupoAlvo && item.grupoAlvo !== GRUPO_TODOS && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              <Users size={12} strokeWidth={2} />
              {item.grupoAlvo}
            </span>
          )}
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.tag} ${config.tagText}`}>
            {config.icon}
            {config.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={2} className="flex-shrink-0 text-gray-600 dark:text-zinc-500" />
          <span className="text-sm font-medium text-gray-800 dark:text-zinc-300">{item.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} className="flex-shrink-0 text-gray-600 dark:text-zinc-500" />
          <span className="text-sm text-gray-700 dark:text-zinc-400">{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} strokeWidth={2} className="flex-shrink-0 text-gray-600 dark:text-zinc-500" />
          <span className="text-sm text-gray-400 dark:text-zinc-500 italic">{item.professor}</span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        {...baseProps}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={`${baseProps.className} cursor-pointer`}
      >
        {content}
      </motion.button>
    );
  }

  return <motion.div {...baseProps}>{content}</motion.div>;
}
