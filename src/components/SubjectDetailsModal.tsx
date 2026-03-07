import { AnimatePresence, motion } from 'framer-motion';
import { X, User, MapPin, Clock, Users, CalendarPlus } from 'lucide-react';
import type { ClassItem, ClassType } from '../data/schedule';
import { parseGruposAlvo, GRUPO_TODOS } from '../data/schedule';
import type { EventoItem } from '../context/AppContext';
import { downloadICS } from '../utils/generateICS';
import { generateEventReminderICS } from '../utils/eventoReminderICS';

const typeLabels: Record<ClassType, string> = {
  teoria: 'Teoria',
  practica: 'Práctica',
  simulacion: 'Simulación',
  virtual: 'Virtual',
};

const typeTagClass: Record<ClassType, string> = {
  teoria: 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-400',
  practica: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400',
  simulacion: 'bg-violet-100 dark:bg-violet-500/20 text-violet-800 dark:text-violet-400',
  virtual: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400',
};

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ClassItem | null;
  eventos: EventoItem[];
}

export function SubjectDetailsModal({ isOpen, onClose, item, eventos }: SubjectDetailsModalProps) {
  if (!item) return null;

  const materiaNome = item.subject?.trim() || '';
  const eventosDaMateria = eventos.filter(
    (e) => materiaNome && e.materia?.trim().toLowerCase() === materiaNome.toLowerCase()
  );

  const handleReminder = (ev: EventoItem) => {
    const ics = generateEventReminderICS(ev);
    const safeName = ev.titulo.replace(/[^a-z0-9\-]/gi, '_').slice(0, 30);
    downloadICS(ics, `lembrete-${safeName}.ics`);
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 truncate">
                    {item.subject || '(Sem nome)'}
                  </h2>
                  <span
                    className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${typeTagClass[item.type] || typeTagClass.teoria}`}
                  >
                    {typeLabels[item.type] || 'Teoria'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                <section>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                      <User size={18} strokeWidth={2} className="text-gray-500 dark:text-zinc-500 shrink-0" />
                      <span className="text-sm">{item.professor || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                      <MapPin size={18} strokeWidth={2} className="text-gray-500 dark:text-zinc-500 shrink-0" />
                      <span className="text-sm">{item.location || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                      <Clock size={18} strokeWidth={2} className="text-gray-500 dark:text-zinc-500 shrink-0" />
                      <span className="text-sm">{item.time || '—'}</span>
                    </div>
                    {(() => {
                      const raw = item.grupoAlvo;
                      const grupos = (typeof raw === 'string'
                        ? parseGruposAlvo(raw)
                        : Array.isArray(raw)
                          ? (raw as string[]).map((g) => String(g).trim()).filter(Boolean)
                          : []
                      ).filter((g) => g !== GRUPO_TODOS);
                      if (grupos.length === 0) return null;
                      return (
                        <div className="flex items-start gap-3 text-gray-700 dark:text-zinc-300">
                          <Users size={18} strokeWidth={2} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                          <div className="flex flex-wrap gap-1.5">
                            {grupos.map((g) => (
                              <span
                                key={g}
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    Avaliações e Eventos
                  </h3>
                  {eventosDaMateria.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-zinc-500 py-4">
                      Nenhuma avaliação agendada
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {eventosDaMateria.map((ev) => (
                        <li
                          key={ev.id}
                          className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-zinc-100">
                              {ev.titulo}
                              {ev.pontuacao && (
                                <span className="text-gray-500 dark:text-zinc-500 font-normal">
                                  {' '}
                                  · {ev.pontuacao}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                              {formatEventDate(ev.data)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReminder(ev)}
                            className="p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shrink-0"
                            aria-label="Adicionar lembrete ao calendário"
                            title="Adicionar lembrete (24h antes)"
                          >
                            <CalendarPlus size={18} strokeWidth={2} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
