import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Settings, Link2, Copy, Check, LifeBuoy, ClipboardList, LogOut, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTurma } from '../context/TurmaContext';
import { DaySelector } from '../components/DaySelector';
import { ScheduleList } from '../components/ScheduleList';
import { GroupFilter, FILTER_TODOS } from '../components/GroupFilter';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { SettingsModal } from '../components/SettingsModal';
import { ManageEventsModal } from '../components/ManageEventsModal';

const actionCards = [
  {
    id: 'gradly',
    icon: Link2,
    label: 'Minha Gradly',
    type: 'link' as const,
    href: '',
    accent: 'indigo',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Ajustes',
    type: 'button' as const,
    onClickKey: 'settings' as const,
    accent: 'neutral',
  },
  {
    id: 'events',
    icon: ClipboardList,
    label: 'Gerenciar Avaliações',
    type: 'button' as const,
    onClickKey: 'events' as const,
    accent: 'neutral',
  },
  {
    id: 'support',
    icon: LifeBuoy,
    label: 'Falar com Suporte',
    type: 'link' as const,
    href: 'https://wa.me/5575992776610?text=' + encodeURIComponent('Olá Filipe, preciso de ajuda com o Gradly'),
    accent: 'emerald',
  },
];

export function DelegadoView() {
  const {
    visibleDays,
    loadingInitial,
    tituloPrincipal,
    subtitulo,
    getInitialDayId,
    groups,
    toast,
  } = useApp();
  const { signOut } = useAuth();
  const { slug } = useTurma();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() => getInitialDayId());
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>(FILTER_TODOS);
  const selectedDay = visibleDays.find((d) => d.id === selectedId) ?? visibleDays[0];

  const schedulePageUrl =
    typeof window !== 'undefined' && slug ? `${window.location.origin}/t/${slug}` : '';

  useEffect(() => {
    if (visibleDays.length > 0 && !visibleDays.some((d) => d.id === selectedId)) {
      setSelectedId(visibleDays[0].id);
    }
  }, [visibleDays, selectedId]);

  useEffect(() => {
    if (
      selectedGroupFilter !== FILTER_TODOS &&
      groups.length > 0 &&
      !groups.includes(selectedGroupFilter)
    ) {
      setSelectedGroupFilter(FILTER_TODOS);
    }
  }, [groups, selectedGroupFilter]);

  const handleCopyScheduleLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!schedulePageUrl) return;
    try {
      await navigator.clipboard.writeText(schedulePageUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleAction = (card: (typeof actionCards)[number]) => {
    if (card.type === 'button') {
      if (card.onClickKey === 'settings') setSettingsOpen(true);
      if (card.onClickKey === 'events') setEventsModalOpen(true);
    }
  };

  const getCardStyles = (accent: string) => {
    const base =
      'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-200 min-h-[88px] text-left w-full';
    const neutral =
      'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50';
    const indigo =
      'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-200/60 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/15';
    const emerald =
      'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/15';
    if (accent === 'indigo') return `${base} ${indigo}`;
    if (accent === 'emerald') return `${base} ${emerald}`;
    return `${base} ${neutral}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300 max-w-md mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-5 pt-12 pb-0"
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                {tituloPrincipal}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">
                {subtitulo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              type="button"
              onClick={() => signOut()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-zinc-700"
              aria-label="Sair"
            >
              <LogOut size={20} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        {/* Grid de Ações Rápidas */}
        <div className="mt-6 grid grid-cols-2 gap-3 mb-6">
          {actionCards.map((card) => {
            const Icon = card.icon;
            const isGradly = card.id === 'gradly';
            return card.type === 'link' ? (
              <motion.a
                key={card.id}
                href={isGradly ? schedulePageUrl : card.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative ${getCardStyles(card.accent)}`}
              >
                {isGradly && (
                  <motion.button
                    type="button"
                    onClick={handleCopyScheduleLink}
                    aria-label={linkCopied ? 'Link copiado' : 'Copiar link'}
                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    {linkCopied ? (
                      <Check size={16} strokeWidth={2} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} strokeWidth={2} className="opacity-70" />
                    )}
                  </motion.button>
                )}
                <Icon size={22} strokeWidth={2} className="shrink-0" />
                <span className="text-sm font-semibold leading-tight text-center">
                  {card.label}
                </span>
              </motion.a>
            ) : (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => handleAction(card)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={getCardStyles(card.accent)}
              >
                <Icon size={22} strokeWidth={2} className="shrink-0" />
                <span className="text-sm font-semibold leading-tight text-center">
                  {card.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ManageEventsModal isOpen={eventsModalOpen} onClose={() => setEventsModalOpen(false)} />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-zinc-800 dark:bg-zinc-700 text-white text-sm font-medium shadow-lg max-w-[90vw]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 mb-4">
        <DaySelector
          days={visibleDays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          layoutId="day-pill-delegado"
        />
      </div>

      {!loadingInitial && groups.length > 0 && (
        <div className="px-5 mb-4">
          <GroupFilter
            groups={groups}
            selected={selectedGroupFilter}
            onSelect={setSelectedGroupFilter}
          />
        </div>
      )}

      <div className="px-5 pb-10">
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-indigo-500" strokeWidth={2} />
            <span className="text-sm text-gray-500 dark:text-zinc-500">Carregando horários...</span>
          </div>
        ) : selectedDay ? (
          <ScheduleList day={selectedDay} selectedGroupFilter={selectedGroupFilter} />
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
