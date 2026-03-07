import { motion } from 'framer-motion';
import { Clock, MapPin, User, Users, Wifi, FlaskConical, BookOpen, Stethoscope, ChevronRight } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';
import { parseGruposAlvo, GRUPO_TODOS } from '../data/schedule';

interface ClassCardProps {
  item: ClassItem;
  index: number;
  onClick?: () => void;
  /** Se true, a aula está acontecendo agora (destaque visual + tag Agora) */
  isActive?: boolean;
  /** Ref para auto-scroll até o card ativo */
  innerRef?: React.Ref<HTMLElement | null>;
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

export function ClassCard({ item, index, onClick, isActive = false, innerRef }: ClassCardProps) {
  const config = typeConfig[item.type];

  const activeClasses = isActive
    ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)] dark:shadow-[0_0_20px_rgba(99,102,241,0.35)]'
    : '';

  const baseProps = {
    layout: true as const,
    custom: index,
    variants: cardVariants,
    initial: 'hidden' as const,
    animate: 'visible' as const,
    transition: { layout: { type: 'spring' as const, stiffness: 350, damping: 30 } },
    className: `rounded-3xl border p-5 ${config.bg} ${config.border} flex gap-3 text-left w-full ${activeClasses} transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30`,
  };

  const content = (
    <>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 leading-tight flex-1 min-w-0">
            {item.subject}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
                Agora
              </span>
            )}
            {(() => {
              const grupos = parseGruposAlvo(item.grupoAlvo).filter((g) => g !== GRUPO_TODOS);
              if (grupos.length === 0) return null;
              return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                  <Users size={12} strokeWidth={2} />
                  {grupos.join(', ')}
                </span>
              );
            })()}
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
      </div>

      {onClick && (
        <div className="flex-shrink-0 flex items-center self-center">
          <ChevronRight size={20} strokeWidth={2} className="w-5 h-5 text-slate-500 dark:text-white/20" aria-hidden />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        {...baseProps}
        {...(innerRef ? { ref: innerRef as React.Ref<HTMLButtonElement> } : {})}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        className={`${baseProps.className} cursor-pointer`}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      {...baseProps}
      {...(innerRef ? { ref: innerRef as React.Ref<HTMLDivElement> } : {})}
    >
      {content}
    </motion.div>
  );
}
