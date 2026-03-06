import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toggle } from './Toggle';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

const sectionLabelClass =
  'block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    tituloPrincipal,
    subtitulo,
    googleDriveUrl,
    platformUrl,
    showSaturday,
    showSunday,
    groups,
    setTituloPrincipal,
    setSubtitulo,
    setGoogleDriveUrl,
    setPlatformUrl,
    setShowSaturday,
    setShowSunday,
    addGroup,
    removeGroup,
    savingMessage,
  } = useApp();

  const [newGroupName, setNewGroupName] = useState('');

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
                  Configurações da Turma
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
                {/* Sessão 1: Textos Principais */}
                <section>
                  <label className={sectionLabelClass}>Textos Principais</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tituloPrincipal}
                      onChange={(e) => setTituloPrincipal(e.target.value)}
                      placeholder="Título da Página"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={subtitulo}
                      onChange={(e) => setSubtitulo(e.target.value)}
                      placeholder="Descrição / Subtítulo"
                      className={inputClass}
                    />
                  </div>
                </section>

                {/* Sessão 2: Links Úteis */}
                <section>
                  <label className={sectionLabelClass}>Links Úteis</label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={googleDriveUrl}
                      onChange={(e) => setGoogleDriveUrl(e.target.value)}
                      placeholder="Link do Google Drive"
                      className={inputClass}
                    />
                    <input
                      type="url"
                      value={platformUrl}
                      onChange={(e) => setPlatformUrl(e.target.value)}
                      placeholder="Link da Plataforma (Moodle, etc.)"
                      className={inputClass}
                    />
                  </div>
                </section>

                {/* Sessão 3: Dias da Semana */}
                <section>
                  <label className={sectionLabelClass}>Dias da Semana</label>
                  <div className="flex flex-col gap-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 p-4 border border-gray-100 dark:border-zinc-700">
                    <Toggle
                      label="Ativar Sábado"
                      checked={showSaturday}
                      onChange={setShowSaturday}
                    />
                    <Toggle
                      label="Ativar Domingo"
                      checked={showSunday}
                      onChange={setShowSunday}
                    />
                  </div>
                </section>

                {/* Sessão 4: Grupos */}
                <section>
                  <label className={sectionLabelClass}>Gerenciar Grupos</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addGroup(newGroupName);
                          setNewGroupName('');
                        }
                      }}
                      placeholder="Ex: Grupo C.2"
                      className={`${inputClass} flex-1`}
                    />
                    <motion.button
                      type="button"
                      onClick={() => {
                        addGroup(newGroupName);
                        setNewGroupName('');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950"
                      aria-label="Adicionar grupo"
                    >
                      <Plus size={22} strokeWidth={2} />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                      {groups.map((g) => (
                        <motion.span
                          key={g}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium"
                        >
                          {g}
                          <button
                            type="button"
                            onClick={() => removeGroup(g)}
                            className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            aria-label={`Excluir ${g}`}
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </div>

              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={Boolean(savingMessage)}
                  whileHover={!savingMessage ? { scale: 1.01 } : undefined}
                  whileTap={!savingMessage ? { scale: 0.99 } : undefined}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 disabled:opacity-80 transition-colors"
                >
                  {savingMessage ? (
                    <>
                      <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                      {savingMessage}
                    </>
                  ) : (
                    <>
                      <Check size={18} strokeWidth={2.5} />
                      Salvar
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
