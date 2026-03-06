import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Plus, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { ClassCardEditable } from '../components/ClassCardEditable';
import { ThemeToggle } from '../components/ThemeToggle';
import { SettingsModal } from '../components/SettingsModal';
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
  } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
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
            <Link
              to="/"
              className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                {tituloPrincipal} — Edición
              </h1>
              <p className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                {subtitulo}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <motion.button
          type="button"
          onClick={() => setSettingsOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold transition-colors"
        >
          <Settings size={18} strokeWidth={2} />
          Configurações da Turma
        </motion.button>
      </motion.header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <DaySelector
        days={visibleDays}
        selectedId={selectedId}
        onSelect={setSelectedId}
        layoutId="day-pill-delegado"
      />

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
