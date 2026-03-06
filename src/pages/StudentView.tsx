import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink, FolderOpen, Settings2, CalendarPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { GroupFilter, FILTER_TODOS } from '../components/GroupFilter';
import { ScheduleList } from '../components/ScheduleList';
import { ThemeToggle } from '../components/ThemeToggle';
import { generateICS, downloadICS, countExportableClasses } from '../utils/generateICS';

const PLATFORM_URL = 'https://campus.upe.edu.py:86/moodle/my/courses.php';

export function StudentView() {
  const { visibleDays, googleDriveUrl, getInitialDayId, groups } = useApp();
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

  const handleExportCalendar = () => {
    const count = countExportableClasses(visibleDays, selectedGroupFilter);
    if (count === 0) {
      alert('Nenhuma aula no grupo selecionado para exportar.');
      return;
    }
    const ics = generateICS(visibleDays, selectedGroupFilter);
    downloadICS(ics);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300 max-w-md mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-5 pt-12 pb-6"
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                Horários Medicina
              </h1>
              <p className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                4º Año — Grupo C.1
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              to="/delegado"
              className="p-2.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Página do Delegado"
              title="Edición"
            >
              <Settings2 size={20} strokeWidth={2} />
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-12 mt-4">
          <motion.a
            href={PLATFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-sm font-semibold transition-colors"
          >
            <ExternalLink size={16} strokeWidth={2} />
            Acessar Plataforma
          </motion.a>
          <motion.a
            href={googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-semibold transition-colors"
          >
            <FolderOpen size={16} strokeWidth={2} />
            Google Drive
          </motion.a>
        </div>
      </motion.header>

      <GroupFilter
        groups={groups}
        selected={selectedGroupFilter}
        onSelect={setSelectedGroupFilter}
      />

      <div className="px-5 mb-4">
        <motion.button
          type="button"
          onClick={handleExportCalendar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:border-indigo-300 text-sm font-semibold transition-colors"
        >
          <CalendarPlus size={18} strokeWidth={2} />
          Adicionar à Agenda
        </motion.button>
      </div>

      <DaySelector
        days={visibleDays}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ScheduleList day={selectedDay} selectedGroupFilter={selectedGroupFilter} />
    </div>
  );
}
