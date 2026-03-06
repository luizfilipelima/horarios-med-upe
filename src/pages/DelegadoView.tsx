import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Plus, Settings, Link2, Copy, Check, LifeBuoy, ClipboardList, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTurma } from '../context/TurmaContext';
import { useGodMode } from '../context/GodModeContext';
import { DaySelector } from '../components/DaySelector';
import { ClassCardEditable } from '../components/ClassCardEditable';
import { ThemeToggle } from '../components/ThemeToggle';
import { SettingsModal } from '../components/SettingsModal';
import { ManageEventsModal } from '../components/ManageEventsModal';
import type { ClassItem } from '../data/schedule';

const emptyClass: ClassItem = {
  subject: '',
  time: '',
  location: '',
  professor: '',
  type: 'teoria',
  grupoAlvo: 'Todos',
};

export function DelegadoView() {
  const {
    visibleDays,
    schedule,
    tituloPrincipal,
    subtitulo,
    updateClass,
    addClass,
    removeClass,
    getInitialDayId,
    groups,
    savingMessage,
  } = useApp();
  const { signOut, profile } = useAuth();
  const { slug } = useTurma();
  const { godModeTurmaId, exitGodMode } = useGodMode();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() => getInitialDayId());
  const selectedDay = visibleDays.find((d) => d.id === selectedId) ?? visibleDays[0];

  useEffect(() => {
    if (visibleDays.length > 0 && !visibleDays.some((d) => d.id === selectedId)) {
      setSelectedId(visibleDays[0].id);
    }
  }, [visibleDays, selectedId]);

  const fullScheduleDay = selectedDay
    ? schedule.find((d) => d.id === selectedDay.id)
    : null;
  const classes = fullScheduleDay?.classes ?? [];

  const handleUpdate = (index: number, field: keyof ClassItem, value: string) => {
    if (!selectedDay) return;
    updateClass(selectedDay.id, index, { [field]: value });
  };

  const handleAdd = () => {
    if (!selectedDay) return;
    addClass(selectedDay.id, { ...emptyClass });
  };

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
        className="px-5 pt-12 pb-4"
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            {(profile?.role === 'ceo' && godModeTurmaId) ? (
              <Link
                to="/admin"
                onClick={() => exitGodMode()}
                className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Sair do Modo Deus"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </Link>
            )}
            <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                {tituloPrincipal} — Edición
              </h1>
              <p className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                {savingMessage ?? subtitulo}
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

        {/* Botões de ação globais — Soft UI, grid responsivo */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1.35fr_0.65fr] gap-3 mb-6">
          <div className="h-12 rounded-2xl flex items-stretch overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all duration-200">
            <motion.a
              href={schedulePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1 min-w-0 flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm"
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
              className="shrink-0 flex items-center justify-center w-11 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/80 dark:hover:bg-indigo-500/30 transition-colors border-l border-indigo-200/60 dark:border-indigo-400/20"
            >
              {linkCopied ? (
                <Check size={18} strokeWidth={2} />
              ) : (
                <Copy size={18} strokeWidth={2} className="opacity-80" />
              )}
            </motion.button>
          </div>

          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/80 font-medium text-sm transition-all duration-200"
          >
            <Settings size={18} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Ajustes</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setEventsModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/80 font-medium text-sm transition-all duration-200 sm:col-span-2"
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
            className="h-12 rounded-2xl px-4 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 font-medium text-sm transition-all duration-200 sm:col-span-2"
          >
            <LifeBuoy size={18} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Falar com Suporte</span>
          </motion.a>
        </div>
      </motion.header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ManageEventsModal isOpen={eventsModalOpen} onClose={() => setEventsModalOpen(false)} />

      {/* Seletor de Dias — mesmo respiro da página do aluno (mb-5) */}
      <div className="px-5 mb-5">
        <DaySelector
          days={visibleDays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          layoutId="day-pill-delegado"
        />
      </div>

      <div className="px-5 pb-10 flex flex-col gap-3">
        {classes.map((cls, i) => (
          <ClassCardEditable
            key={`${selectedDay?.id}-${i}`}
            item={cls}
            index={i}
            groups={groups}
            onUpdate={(field, value) => handleUpdate(i, field, value)}
            onRemove={() => selectedDay && removeClass(selectedDay.id, i)}
          />
        ))}
        <motion.button
          type="button"
          onClick={handleAdd}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-center gap-2 w-full py-5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/30 text-gray-500 dark:text-zinc-500 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Plus size={20} strokeWidth={2} />
          <span className="text-sm font-semibold">Adicionar Nueva Materia</span>
        </motion.button>
      </div>
    </div>
  );
}
