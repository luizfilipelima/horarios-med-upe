import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { Toggle } from '../components/Toggle';
import { ClassCardEditable } from '../components/ClassCardEditable';
import { ThemeToggle } from '../components/ThemeToggle';
import type { ClassItem } from '../data/schedule';

const PLATFORM_URL = 'https://campus.upe.edu.py:86/moodle/my/courses.php';

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
    googleDriveUrl,
    setGoogleDriveUrl,
    showSaturday,
    showSunday,
    setShowSaturday,
    setShowSunday,
    updateClass,
    addClass,
    removeClass,
    getInitialDayId,
    groups,
    addGroup,
    removeGroup,
  } = useApp();

  const [newGroupName, setNewGroupName] = useState('');
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
        className="px-5 pt-12 pb-6"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
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
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              Horários — Edición
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-zinc-500 pl-14 mb-6">
          4º Año — Grupo C.1
        </p>

        <div className="space-y-5 pl-14">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Link del Google Drive del grupo
            </label>
            <input
              type="url"
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-4 border border-gray-100 dark:border-zinc-800">
            <Toggle
              label="Activar Sábado"
              checked={showSaturday}
              onChange={setShowSaturday}
            />
            <Toggle
              label="Activar Domingo"
              checked={showSunday}
              onChange={setShowSunday}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Gerenciar Grupos
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGroup(newGroupName), setNewGroupName(''))}
                placeholder="Ej: Grupo C.2"
                className="flex-1 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:outline-none"
              />
              <motion.button
                type="button"
                onClick={() => { addGroup(newGroupName); setNewGroupName(''); }}
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
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-14 mt-4">
          <motion.a
            href={PLATFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-sm font-semibold transition-colors"
          >
            Acessar Plataforma
          </motion.a>
        </div>
      </motion.header>

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
