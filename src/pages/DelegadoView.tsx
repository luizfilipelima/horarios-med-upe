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

  const schedulePageUrl = typeof window !== 'undefined' && slug
    ? `${window.location.origin}/t/${slug}`
    : '';
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

  const supportWhatsAppUrl =
    'https://wa.me/5575992776610?text=' +
    encodeURIComponent('Olá Filipe, preciso de ajuda com o Gradly');

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
              className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="Sair"
            >
              <LogOut size={20} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        {/* Botões de ação globais — alto contraste modo claro */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1.35fr_0.65fr] gap-3 mb-6">
          <div className="h-12 rounded-2xl flex items-stretch overflow-hidden bg-white dark:bg-indigo-500/10 border border-indigo-200 dark:border-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all duration-200 shadow-sm dark:shadow-none">
            <motion.a
              href={schedulePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1 min-w-0 flex items-center justify-center gap-2 text-indigo-800 dark:text-indigo-400 font-semibold text-sm"
            >
              <Link2 size={18} strokeWidth={2} className="shrink-0" />
              <span className="truncate">Minha Gradly</span>
            </motion.a>
            <motion.button
              type="button"
              onClick={handleCopyScheduleLink}
              aria-label={linkCopied ? 'Link copiado' : 'Copiar link'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="shrink-0 flex items-center justify-center w-11 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors border-l border-indigo-200 dark:border-indigo-400/20"
            >
              {linkCopied ? (
                <Check size={18} strokeWidth={2} />
              ) : (
                <Copy size={18} strokeWidth={2} className="opacity-90" />
              )}
            </motion.button>
          </div>

          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/80 font-medium text-sm transition-all duration-200 shadow-sm dark:shadow-none"
          >
            <Settings size={18} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Ajustes</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setEventsModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/80 font-medium text-sm transition-all duration-200 sm:col-span-2 shadow-sm dark:shadow-none"
          >
            <ClipboardList size={18} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Gerenciar Avaliações</span>
          </motion.button>

          <motion.a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-white dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/20 font-semibold text-sm transition-all duration-200 sm:col-span-2 shadow-sm dark:shadow-none"
          >
            <LifeBuoy size={18} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Falar com Suporte</span>
          </motion.a>
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

      {/* Seletor de Dias */}
      <div className="px-5 mb-4">
        <DaySelector
          days={visibleDays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          layoutId="day-pill-delegado"
        />
      </div>

      {/* Filtro de Grupo — mostra matérias vinculadas ao grupo selecionado */}
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
