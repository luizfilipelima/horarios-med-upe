import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Loader2, CalendarClock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventoTipo } from '../context/AppContext';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

const sectionLabelClass =
  'block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2';

const TIPOS: { value: EventoTipo; label: string }[] = [
  { value: 'Prova', label: 'Prova' },
  { value: 'Trabalho', label: 'Trabalho' },
  { value: 'Outros', label: 'Outros' },
];

interface ManageEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ManageEventsModal({ isOpen, onClose }: ManageEventsModalProps) {
  const { eventos, addEvento, removeEvento, savingMessage } = useApp();

  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [data, setData] = useState('');
  const [pontuacao, setPontuacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<EventoTipo>('Prova');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    const dateStr = data || new Date().toISOString().slice(0, 16);
    const iso = new Date(dateStr).toISOString();
    await addEvento({
      titulo: titulo.trim(),
      materia: materia.trim(),
      data: iso,
      pontuacao: pontuacao.trim(),
      descricao: descricao.trim(),
      tipo,
    });
    setTitulo('');
    setMateria('');
    setData('');
    setPontuacao('');
    setDescricao('');
    setTipo('Prova');
  };

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
                  Gerenciar Avaliações e Eventos
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <section>
                    <label className={sectionLabelClass}>Novo evento</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Título (ex: Prova 1)"
                        className={inputClass}
                        required
                      />
                      <input
                        type="text"
                        value={materia}
                        onChange={(e) => setMateria(e.target.value)}
                        placeholder="Matéria"
                        className={inputClass}
                      />
                      <div className="relative">
                        <div
                          className={`flex items-center gap-3 ${inputClass} pointer-events-none min-h-[44px]`}
                          aria-hidden
                        >
                          <CalendarClock
                            size={18}
                            className="text-gray-400 dark:text-zinc-500 shrink-0"
                            strokeWidth={2}
                          />
                          <span
                            className={
                              data
                                ? 'text-gray-900 dark:text-zinc-100'
                                : 'text-gray-400 dark:text-zinc-600'
                            }
                          >
                            {data
                              ? formatEventDate(new Date(data).toISOString())
                              : 'Definir data e horário'}
                          </span>
                        </div>
                        <input
                          type="datetime-local"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer min-h-[44px]"
                          aria-label="Definir data e horário"
                        />
                      </div>
                      <input
                        type="text"
                        value={pontuacao}
                        onChange={(e) => setPontuacao(e.target.value)}
                        placeholder="Pontuação (ex: 10 pts)"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descrição"
                        className={inputClass}
                      />
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as EventoTipo)}
                        className={`select-arrow select-arrow-right ${inputClass}`}
                      >
                        {TIPOS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={Boolean(savingMessage)}
                      whileHover={!savingMessage ? { scale: 1.02 } : undefined}
                      whileTap={!savingMessage ? { scale: 0.98 } : undefined}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 disabled:opacity-80 transition-colors"
                    >
                      {savingMessage ? (
                        <>
                          <Loader2 size={18} strokeWidth={2} className="animate-spin flex-shrink-0" />
                          Adicionar evento
                        </>
                      ) : (
                        <>
                          <Plus size={18} strokeWidth={2} />
                          Adicionar evento
                        </>
                      )}
                    </motion.button>
                  </section>
                </form>

                <section>
                  <label className={sectionLabelClass}>Eventos cadastrados</label>
                  <ul className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {eventos.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-zinc-500 py-4 text-center rounded-2xl bg-gray-50 dark:bg-zinc-800/60">
                          Nenhum evento ainda.
                        </p>
                      ) : (
                        eventos.map((ev) => (
                          <motion.li
                            key={ev.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                                {ev.titulo}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-zinc-500">
                                {ev.materia && `${ev.materia} · `}
                                {formatEventDate(ev.data)}
                                {ev.pontuacao && ` · ${ev.pontuacao}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEvento(ev.id)}
                              className="p-2 rounded-xl text-gray-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              aria-label={`Excluir ${ev.titulo}`}
                            >
                              <Trash2 size={18} strokeWidth={2} />
                            </button>
                          </motion.li>
                        ))
                      )}
                    </AnimatePresence>
                  </ul>
                </section>
              </div>

              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Concluído
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
