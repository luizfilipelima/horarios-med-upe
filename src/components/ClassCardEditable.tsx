import { motion } from 'framer-motion';
import { Clock, MapPin, User, Wifi, FlaskConical, BookOpen, Trash2, Users, Stethoscope } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';
import { GRUPO_TODOS } from '../data/schedule';

interface ClassCardEditableProps {
  item: ClassItem;
  index: number;
  groups: string[];
  onUpdate: (field: keyof ClassItem, value: string) => void;
  onRemove: () => void;
}

const typeConfig: Record<ClassType, { label: string; bg: string; border: string; tag: string; tagText: string; icon: React.ReactNode }> = {
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

const typeOptions: { value: ClassType; label: string }[] = [
  { value: 'teoria', label: 'Teoria' },
  { value: 'simulacion', label: 'Simulación' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'practica', label: 'Prática' },
];

const inputClass =
  'w-full rounded-xl border-0 bg-white/70 dark:bg-zinc-800/70 py-2 px-3 text-sm font-medium text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:outline-none';

export function ClassCardEditable({ item, index, groups, onUpdate, onRemove }: ClassCardEditableProps) {
  const config = typeConfig[item.type];
  const grupoValue = item.grupoAlvo === GRUPO_TODOS || groups.includes(item.grupoAlvo)
    ? item.grupoAlvo
    : GRUPO_TODOS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
      className={`rounded-3xl border p-5 ${config.bg} ${config.border} flex flex-col gap-3 relative`}
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label="Excluir aula"
        className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors z-10"
      >
        <Trash2 size={18} strokeWidth={2} />
      </button>

      <div className="flex items-start justify-between gap-2 pr-10">
        <input
          type="text"
          value={item.subject}
          onChange={(e) => onUpdate('subject', e.target.value)}
          placeholder="Nome da matéria"
          className={`${inputClass} flex-1 font-bold`}
        />
        <select
          value={item.type}
          onChange={(e) => onUpdate('type', e.target.value as ClassType)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${config.tag} ${config.tagText} border-0 cursor-pointer`}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={2} className="flex-shrink-0 text-gray-500 dark:text-zinc-500" />
          <input
            type="text"
            value={item.time}
            onChange={(e) => onUpdate('time', e.target.value)}
            placeholder="Ex: 09:00 - 13:00"
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} className="flex-shrink-0 text-gray-500 dark:text-zinc-500" />
          <input
            type="text"
            value={item.location}
            onChange={(e) => onUpdate('location', e.target.value)}
            placeholder="Sala / Local"
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2">
          <User size={14} strokeWidth={2} className="flex-shrink-0 text-gray-500 dark:text-zinc-500" />
          <input
            type="text"
            value={item.professor}
            onChange={(e) => onUpdate('professor', e.target.value)}
            placeholder="Professor"
            className={`${inputClass} italic`}
          />
        </div>
        <div className="pt-1 border-t border-gray-200/80 dark:border-zinc-700/60">
          <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-500 mb-1.5">
            Grupo alvo (só delegado)
          </label>
          <div className="flex items-center gap-2">
            <Users size={14} strokeWidth={2} className="flex-shrink-0 text-gray-500 dark:text-zinc-500" />
            <select
              value={grupoValue}
              onChange={(e) => onUpdate('grupoAlvo', e.target.value)}
              className={`${inputClass} flex-1 cursor-pointer border border-gray-200 dark:border-zinc-700 rounded-xl`}
            >
              <option value={GRUPO_TODOS}>Todos los Grupos</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
