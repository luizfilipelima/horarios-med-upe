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

const quickActionClass =
  'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-400 bg-gray-50/80 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-700/60 hover:text-gray-900 dark:hover:text-zinc-200 border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 transition-all duration-200';

export function StudentView() {
  const { visibleDays, tituloPrincipal, subtitulo, googleDriveUrl, platformUrl, getInitialDayId, groups } = useApp();
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
      {/* Header: apenas identidade e tema */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-5 pt-12 pb-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <GraduationCap size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                {tituloPrincipal}
              </h1>
              <p className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                {subtitulo}
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
      </motion.header>

      {/* Ações Rápidas: botões com peso visual reduzido */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        className="px-5 pt-2"
      >
        <div className="flex flex-wrap gap-2">
          <motion.a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={quickActionClass}
          >
            <ExternalLink size={15} strokeWidth={2} />
            Acessar Plataforma
          </motion.a>
          <motion.a
            href={googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={quickActionClass}
          >
            <FolderOpen size={15} strokeWidth={2} />
            Google Drive
          </motion.a>
          <motion.button
            type="button"
            onClick={handleExportCalendar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={quickActionClass}
          >
            <CalendarPlus size={15} strokeWidth={2} />
            Adicionar à Agenda
          </motion.button>
        </div>
      </motion.section>

      {/* Separador sutil + área Horários (filtro de grupo + dias) */}
      <div className="mt-10 pt-1">
        <div className="px-5">
          <div className="h-px bg-gray-200 dark:bg-zinc-800" aria-hidden />
        </div>

        {/* Navegação: Grupo + Dias da semana */}
        <div className="mt-8 px-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Grupo
          </p>
          <GroupFilter
            groups={groups}
            selected={selectedGroupFilter}
            onSelect={setSelectedGroupFilter}
          />
        </div>

        <div className="mt-4 px-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Dia da semana
          </p>
          <DaySelector
            days={visibleDays}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Lista de cards com respiro */}
      <div className="mt-8">
        <ScheduleList day={selectedDay} selectedGroupFilter={selectedGroupFilter} />
      </div>
    </div>
  );
}
