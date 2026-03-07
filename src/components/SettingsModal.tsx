import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Check, Loader2, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toggle } from './Toggle';
import { ManageScheduleModal } from './ManageScheduleModal';

const BLOCK_CLASS =
  'rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-white/5';

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
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

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
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Configurações da Turma
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-full text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
                {/* Bloco 1: Dados Básicos */}
                <section className={BLOCK_CLASS}>
                  <label className="label-premium">Dados Básicos</label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="settings-titulo" className="label-premium">
                        Nome da Turma
                      </label>
                      <input
                        id="settings-titulo"
                        type="text"
                        value={tituloPrincipal}
                        onChange={(e) => setTituloPrincipal(e.target.value)}
                        placeholder="Ex: Horários Medicina"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-subtitulo" className="label-premium">
                        Faculdade / Curso
                      </label>
                      <input
                        id="settings-subtitulo"
                        type="text"
                        value={subtitulo}
                        onChange={(e) => setSubtitulo(e.target.value)}
                        placeholder="Ex: 4º Año — Grupo C.1"
                        className="input-premium"
                      />
                    </div>
                  </div>
                </section>

                {/* Bloco 2: Links Úteis */}
                <section className={BLOCK_CLASS}>
                  <label className="label-premium">Links Úteis</label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="settings-drive" className="label-premium">
                        Google Drive
                      </label>
                      <input
                        id="settings-drive"
                        type="url"
                        value={googleDriveUrl}
                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-platform" className="label-premium">
                        Plataforma (Moodle, etc.)
                      </label>
                      <input
                        id="settings-platform"
                        type="url"
                        value={platformUrl}
                        onChange={(e) => setPlatformUrl(e.target.value)}
                        placeholder="https://campus.upe.edu.py/..."
                        className="input-premium"
                      />
                    </div>
                  </div>
                </section>

                {/* Bloco 3: Configuração de Dias e Grupos */}
                <section className={BLOCK_CLASS}>
                  <label className="label-premium">Horários e Matérias</label>
                  <motion.button
                    type="button"
                    onClick={() => setScheduleModalOpen(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold text-sm hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-100/50 dark:hover:bg-indigo-500/15 transition-colors"
                  >
                    <CalendarDays size={20} strokeWidth={2} />
                    Gerenciar Horários
                  </motion.button>
                  <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                    Adicionar, editar ou excluir matérias por dia
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/5">
                    <label className="label-premium">Dias da Semana</label>
                    <div className="flex flex-col gap-3">
                      <div className="min-h-[44px] flex items-center">
                        <Toggle
                          label="Ativar Sábado"
                          checked={showSaturday}
                          onChange={setShowSaturday}
                        />
                      </div>
                      <div className="min-h-[44px] flex items-center">
                        <Toggle
                          label="Ativar Domingo"
                          checked={showSunday}
                          onChange={setShowSunday}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/5">
                    <label className="label-premium">Grupos da Turma</label>
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
                        placeholder="Ex: C.2"
                        className="input-premium flex-1"
                      />
                      <motion.button
                        type="button"
                        onClick={() => {
                          addGroup(newGroupName);
                          setNewGroupName('');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
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
                            className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
                          >
                            {g}
                            <button
                              type="button"
                              onClick={() => removeGroup(g)}
                              className="p-0.5 rounded-full hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 hover:text-red-600 dark:hover:text-red-400 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                              aria-label={`Excluir ${g}`}
                            >
                              <X size={14} strokeWidth={2} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>
              </div>

              {/* Rodapé fixo — hierarquia de ações */}
              <div className="flex-shrink-0 sticky bottom-0 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-2xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="button"
                    onClick={onClose}
                    disabled={Boolean(savingMessage)}
                    whileHover={!savingMessage ? { scale: 1.01 } : undefined}
                    whileTap={!savingMessage ? { scale: 0.99 } : undefined}
                    className="flex-1 h-12 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-80 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingMessage ? (
                      <>
                        <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={2.5} />
                        Salvar
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
          <ManageScheduleModal
            isOpen={scheduleModalOpen}
            onClose={() => setScheduleModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
