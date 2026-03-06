import { AnimatePresence, motion } from 'framer-motion';
import { X, ExternalLink, FolderOpen, CalendarPlus, Shield, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GroupFilter } from './GroupFilter';

const sectionLabelClass =
  'block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3';

const menuItemClass =
  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-700/80 border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 transition-all duration-200';

interface StudentMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: string[];
  selectedGroupFilter: string;
  setSelectedGroupFilter: (v: string) => void;
  platformUrl: string;
  googleDriveUrl: string;
  onExportCalendar: () => void;
  onOpenEvents?: () => void;
  futureEventsCount?: number;
}

export function StudentMenuModal({
  isOpen,
  onClose,
  groups,
  selectedGroupFilter,
  setSelectedGroupFilter,
  platformUrl,
  googleDriveUrl,
  onExportCalendar,
  onOpenEvents,
  futureEventsCount = 0,
}: StudentMenuModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Opções
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                {/* Seção 1: Filtro de Turma */}
                <section>
                  <label className={sectionLabelClass}>Filtro de Turma</label>
                  <GroupFilter
                    groups={groups}
                    selected={selectedGroupFilter}
                    onSelect={setSelectedGroupFilter}
                  />
                </section>

                {/* Seção 2: Links e Ferramentas */}
                <section>
                  <label className={sectionLabelClass}>Links e Ferramentas</label>
                  <div className="flex flex-col gap-2">
                    <a
                      href={platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={menuItemClass}
                    >
                      <ExternalLink size={18} strokeWidth={2} className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                      Acessar Plataforma
                    </a>
                    <a
                      href={googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={menuItemClass}
                    >
                      <FolderOpen size={18} strokeWidth={2} className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                      Google Drive
                    </a>
                    <button
                      type="button"
                      onClick={() => { onExportCalendar(); onClose(); }}
                      className={menuItemClass}
                    >
                      <CalendarPlus size={18} strokeWidth={2} className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                      Adicionar à Agenda
                    </button>
                    {onOpenEvents && (
                      <button
                        type="button"
                        onClick={() => { onOpenEvents(); onClose(); }}
                        className={menuItemClass}
                      >
                        <ClipboardList size={18} strokeWidth={2} className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                        Mural de Avaliações
                        {futureEventsCount > 0 && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" aria-hidden />
                        )}
                      </button>
                    )}
                  </div>
                </section>

                {/* Seção 3: Administração */}
                <section>
                  <label className={sectionLabelClass}>Administração</label>
                  <Link
                    to="/delegado"
                    onClick={onClose}
                    className={`${menuItemClass} border border-gray-200 dark:border-zinc-700 bg-transparent dark:bg-transparent hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400`}
                  >
                    <Shield size={18} strokeWidth={2} className="flex-shrink-0" />
                    Área do Administrador
                  </Link>
                </section>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
