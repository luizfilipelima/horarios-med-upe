import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, FlaskConical, Wifi, Stethoscope } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';
import type { DaySchedule } from '../data/schedule';

const typeConfig: Record<ClassType, { label: string; bg: string; border: string; icon: React.ReactNode }> = {
  teoria: {
    label: 'Teoria',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200 dark:border-sky-500/20',
    icon: <BookOpen size={16} strokeWidth={2.5} />,
  },
  simulacion: {
    label: 'Simulación',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/20',
    icon: <FlaskConical size={16} strokeWidth={2.5} />,
  },
  virtual: {
    label: 'Virtual',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    icon: <Wifi size={16} strokeWidth={2.5} />,
  },
  practica: {
    label: 'Prática',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    icon: <Stethoscope size={16} strokeWidth={2.5} />,
  },
};

const TIPOS: ClassType[] = ['teoria', 'simulacion', 'virtual', 'practica'];

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: DaySchedule[];
  onAddEmpty: () => void;
  onCopyFrom: (item: ClassItem) => void;
}

function getTemplateByType(schedule: DaySchedule[], tipo: ClassType): ClassItem | null {
  for (const day of schedule) {
    const found = day.classes.find((c) => c.type === tipo);
    if (found) return found;
  }
  return null;
}

export function AddClassModal({ isOpen, onClose, schedule, onAddEmpty, onCopyFrom }: AddClassModalProps) {
  const handleAddEmpty = () => {
    onAddEmpty();
    onClose();
  };

  const handleTemplate = (item: ClassItem) => {
    onCopyFrom(item);
    onClose();
  };

  const templates = TIPOS.map((tipo) => {
    const template = getTemplateByType(schedule, tipo);
    const config = typeConfig[tipo];
    return { tipo, template, config };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-xl dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                  Adicionar Nueva Materia
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  type="button"
                  onClick={handleAddEmpty}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-700 dark:text-zinc-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                >
                  <Plus size={20} strokeWidth={2} className="flex-shrink-0" />
                  <span className="font-medium text-left">Nova matéria em branco</span>
                </button>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2 px-1">
                    Ou usar template por tipo
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(({ tipo, template, config }) => {
                      if (!template) return null;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => handleTemplate(template)}
                          className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-colors hover:opacity-90 ${config.bg} ${config.border}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400">{config.icon}</span>
                            <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                              {config.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">
                            {template.subject || '(Sem nome)'}
                          </span>
                          {template.time && (
                            <span className="text-xs text-gray-500 dark:text-zinc-500">
                              {template.time}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
