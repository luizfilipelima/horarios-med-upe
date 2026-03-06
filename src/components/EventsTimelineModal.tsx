import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventoItem, EventoTipo } from '../context/AppContext';
import { diasAteEvento, labelDiasEvento, somaPontuacao } from '../utils/eventos';

interface EventsTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function cardBgByTipo(tipo: EventoTipo): string {
  switch (tipo) {
    case 'Prova':
      return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-400/20 text-rose-800 dark:text-rose-200';
    case 'Trabalho':
      return 'bg-violet-50 dark:bg-violet-500/10 border-violet-200/60 dark:border-violet-400/20 text-violet-800 dark:text-violet-200';
    default:
      return 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200/60 dark:border-zinc-600/40 text-slate-800 dark:text-zinc-200';
  }
}

function EventCard({ ev }: { ev: EventoItem }) {
  const dias = diasAteEvento(ev.data);
  const label = labelDiasEvento(ev.data);
  const isFuture = dias >= 0;
  const bgClass = cardBgByTipo(ev.tipo);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={`rounded-2xl border p-4 ${bgClass}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight">{ev.titulo}</h3>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            isFuture
              ? 'bg-white/70 dark:bg-black/20 text-inherit'
              : 'bg-black/10 dark:bg-white/10 text-inherit opacity-80'
          }`}
        >
          {label}
        </span>
      </div>
      <p className="text-xs opacity-90 mb-1">
        {ev.materia && `${ev.materia} · `}
        {formatEventDate(ev.data)}
      </p>
      {ev.pontuacao && (
        <p className="text-xs font-medium opacity-90">Pontuação: {ev.pontuacao}</p>
      )}
      {ev.descricao && (
        <p className="text-xs mt-2 opacity-80 line-clamp-2">{ev.descricao}</p>
      )}
    </motion.article>
  );
}

export function EventsTimelineModal({ isOpen, onClose }: EventsTimelineModalProps) {
  const { eventos } = useApp();
  const [tab, setTab] = useState<'proximos' | 'passados'>('proximos');

  const { proximos, passados } = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prox: EventoItem[] = [];
    const pass: EventoItem[] = [];
    for (const ev of eventos) {
      const d = diasAteEvento(ev.data);
      if (d >= 0) prox.push(ev);
      else pass.push(ev);
    }
    prox.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    pass.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return { proximos: prox, passados: pass };
  }, [eventos]);

  const list = tab === 'proximos' ? proximos : passados;
  const totalPontos = useMemo(() => somaPontuacao(eventos), [eventos]);

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
                  Mural de Avaliações
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

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {eventos.length > 0 && (
                  <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 rounded-2xl bg-gray-100 dark:bg-zinc-800/60 px-4 py-2.5">
                    Total distribuído: <strong>{totalPontos}</strong> pontos
                  </p>
                )}

                <div className="flex gap-2 p-1 rounded-full bg-gray-100 dark:bg-zinc-800/80 w-fit">
                  {(['proximos', 'passados'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        tab === t
                          ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm'
                          : 'text-gray-600 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
                      }`}
                    >
                      {t === 'proximos' ? 'Próximos' : 'Passados'}
                    </button>
                  ))}
                </div>

                <section>
                  <AnimatePresence mode="wait">
                    {list.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-gray-500 dark:text-zinc-500 py-8 text-center rounded-2xl bg-gray-50 dark:bg-zinc-800/40"
                      >
                        {tab === 'proximos'
                          ? 'Nenhum evento próximo.'
                          : 'Nenhum evento passado.'}
                      </motion.p>
                    ) : (
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, x: tab === 'proximos' ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: tab === 'proximos' ? 8 : -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {list.map((ev) => (
                          <EventCard key={ev.id} ev={ev} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
