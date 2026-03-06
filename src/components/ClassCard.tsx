import { motion } from 'framer-motion';
import { Clock, MapPin, User, Wifi, FlaskConical, BookOpen, Stethoscope } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';

interface ClassCardProps {
  item: ClassItem;
  index: number;
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
    border: 'border-sky-100 dark:border-sky-500/20',
    tag: 'bg-sky-100 dark:bg-sky-500/20',
    tagText: 'text-sky-600 dark:text-sky-400',
    icon: <BookOpen size={12} strokeWidth={2.5} />,
  },
  simulacion: {
    label: 'Simulación',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-100 dark:border-violet-500/20',
    tag: 'bg-violet-100 dark:bg-violet-500/20',
    tagText: 'text-violet-600 dark:text-violet-400',
    icon: <FlaskConical size={12} strokeWidth={2.5} />,
  },
  virtual: {
    label: 'Virtual',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    tag: 'bg-emerald-100 dark:bg-emerald-500/20',
    tagText: 'text-emerald-600 dark:text-emerald-400',
    icon: <Wifi size={12} strokeWidth={2.5} />,
  },
  practica: {
    label: 'Prática',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-100 dark:border-amber-500/20',
    tag: 'bg-amber-100 dark:bg-amber-500/20',
    tagText: 'text-amber-600 dark:text-amber-400',
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

export function ClassCard({ item, index }: ClassCardProps) {
  const config = typeConfig[item.type];

  return (
    <motion.div
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ layout: { type: 'spring', stiffness: 350, damping: 30 } }}
      className={`rounded-3xl border p-5 ${config.bg} ${config.border} flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 leading-tight flex-1">
          {item.subject}
        </h3>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${config.tag} ${config.tagText}`}>
          {config.icon}
          {config.label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-zinc-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{item.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-zinc-500" />
          <span className="text-sm text-gray-600 dark:text-zinc-400">{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} strokeWidth={2} className="flex-shrink-0 text-gray-400 dark:text-zinc-500" />
          <span className="text-sm text-gray-400 dark:text-zinc-500 italic">{item.professor}</span>
        </div>
      </div>
    </motion.div>
  );
}
