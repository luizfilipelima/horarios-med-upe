import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Loader2, CalendarClock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventoTipo } from '../context/AppContext';

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
  const { schedule, eventos, addEvento, removeEvento, savingMessage } = useApp();

  const materias = useMemo(() => {
    const set = new Set<string>();
    for (const day of schedule) {
      for (const c of day.classes) {
        if (c.subject?.trim()) set.add(c.subject.trim());
      }
    }
    return Array.from(set).sort();
  }, [schedule]);

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
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Gerenciar Avaliações e Eventos
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

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Bloco: Criar Novo Evento */}
                <section className="p-5 pb-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <label className="label-premium">Criar Novo Evento</label>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="ev-titulo" className="label-premium">
                        Título
                      </label>
                      <input
                        id="ev-titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Prova 1"
                        className="input-premium"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="ev-materia" className="label-premium">
                        Matéria
                      </label>
                      <select
                        id="ev-materia"
                        value={materia}
                        onChange={(e) => setMateria(e.target.value)}
                        className="input-premium select-arrow select-arrow-right"
                      >
                        <option value="" disabled={materias.length === 0}>
                          {materias.length === 0
                            ? 'Cadastre uma matéria primeiro'
                            : 'Selecione a matéria'}
                        </option>
                        {materias.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ev-data" className="label-premium">
                        Data e horário
                      </label>
                      <div className="relative">
                        <div
                          className="input-premium flex items-center gap-3 pointer-events-none"
                          aria-hidden
                        >
                          <CalendarClock
                            size={18}
                            className="text-slate-400 dark:text-zinc-500 shrink-0"
                            strokeWidth={2}
                          />
                          <span
                            className={
                              data
                                ? 'text-slate-900 dark:text-zinc-100'
                                : 'text-slate-400 dark:text-zinc-500'
                            }
                          >
                            {data
                              ? formatEventDate(new Date(data).toISOString())
                              : 'Definir data e horário'}
                          </span>
                        </div>
                        <input
                          id="ev-data"
                          type="datetime-local"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Definir data e horário"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ev-pontuacao" className="label-premium">
                        Pontuação
                      </label>
                      <input
                        id="ev-pontuacao"
                        type="text"
                        value={pontuacao}
                        onChange={(e) => setPontuacao(e.target.value)}
                        placeholder="Ex: 10 pts"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label htmlFor="ev-descricao" className="label-premium">
                        Descrição
                      </label>
                      <input
                        id="ev-descricao"
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Opcional"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label htmlFor="ev-tipo" className="label-premium">
                        Tipo
                      </label>
                      <select
                        id="ev-tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as EventoTipo)}
                        className="input-premium select-arrow select-arrow-right"
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
                      whileHover={!savingMessage ? { scale: 1.01 } : undefined}
                      whileTap={!savingMessage ? { scale: 0.99 } : undefined}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-80 transition-colors"
                    >
                      {savingMessage ? (
                        <>
                          <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                          Adicionar evento
                        </>
                      ) : (
                        <>
                          <Plus size={18} strokeWidth={2} />
                          Adicionar evento
                        </>
                      )}
                    </motion.button>
                  </form>
                </section>

                {/* Bloco: Eventos Cadastrados */}
                <section className="p-5">
                  <label className="label-premium">Eventos Cadastrados</label>
                  <ul className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {eventos.length === 0 ? (
                        <li className="text-sm text-slate-500 dark:text-zinc-500 py-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-white/5">
                          Nenhum evento cadastrado.
                        </li>
                      ) : (
                        eventos.map((ev) => (
                          <motion.li
                            key={ev.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600/80 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                {ev.titulo}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-500">
                                {ev.materia && `${ev.materia} · `}
                                {formatEventDate(ev.data)}
                                {ev.pontuacao && ` · ${ev.pontuacao}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEvento(ev.id)}
                              className="p-2.5 rounded-xl text-slate-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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

              {/* Rodapé fixo — ação secundária */}
              <div className="flex-shrink-0 sticky bottom-0 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 flex items-center justify-center rounded-2xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Concluído
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
