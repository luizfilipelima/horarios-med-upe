import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy } from 'lucide-react';
import type { ClassItem } from '../data/schedule';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onAddEmpty: () => void;
  onCopyFrom: (item: ClassItem) => void;
}

export function AddClassModal({ isOpen, onClose, classes, onAddEmpty, onCopyFrom }: AddClassModalProps) {
  const handleAddEmpty = () => {
    onAddEmpty();
    onClose();
  };

  const handleCopy = (item: ClassItem) => {
    onCopyFrom(item);
    onClose();
  };

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
              <div className="p-4 space-y-2">
                <button
                  type="button"
                  onClick={handleAddEmpty}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-700 dark:text-zinc-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                >
                  <Plus size={20} strokeWidth={2} className="flex-shrink-0" />
                  <span className="font-medium text-left">Nova matéria em branco</span>
                </button>

                {classes.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2 px-1">
                      Ou copiar de matéria existente
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {classes.map((cls, i) => (
                        <button
                          key={`${cls.subject}-${cls.time}-${i}`}
                          type="button"
                          onClick={() => handleCopy(cls)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-left transition-colors"
                        >
                          <Copy size={16} strokeWidth={2} className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                          <span className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate">
                            {cls.subject || '(Sem nome)'}
                          </span>
                          {cls.time && (
                            <span className="text-xs text-gray-500 dark:text-zinc-500 ml-auto flex-shrink-0">
                              {cls.time}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
