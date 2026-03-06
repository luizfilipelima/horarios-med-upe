import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { ScheduleList } from '../components/ScheduleList';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { StudentMenuModal } from '../components/StudentMenuModal';
import { EventsTimelineModal } from '../components/EventsTimelineModal';
import { FILTER_TODOS } from '../components/GroupFilter';
import { generateICS, downloadICS, countExportableClasses } from '../utils/generateICS';
import { diasAteEvento } from '../utils/eventos';

export function StudentView() {
  const { visibleDays, tituloPrincipal, subtitulo, googleDriveUrl, platformUrl, getInitialDayId, groups, eventos, loadingInitial } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsTimelineOpen, setEventsTimelineOpen] = useState(false);

  const futureEventsCount = useMemo(
    () => eventos.filter((e) => diasAteEvento(e.data) >= 0).length,
    [eventos]
  );
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

  // Título da página e meta tags para aba e compartilhamento (ex.: WhatsApp)
  useEffect(() => {
    if (loadingInitial || !tituloPrincipal) return;
    const title = tituloPrincipal.trim() ? `${tituloPrincipal} | Gradly` : 'Gradly';
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', 'content', tituloPrincipal.trim() || 'Gradly');
    setMeta('meta[name="twitter:title"]', 'content', tituloPrincipal.trim() || 'Gradly');
    setMeta('meta[property="og:url"]', 'content', window.location.href);
    setMeta('meta[name="description"]', 'content', subtitulo?.trim() ? `${tituloPrincipal} – ${subtitulo}` : `Gradly – ${tituloPrincipal}`);
    setMeta('meta[property="og:description"]', 'content', subtitulo?.trim() ? `${tituloPrincipal} – ${subtitulo}` : `Gradly – ${tituloPrincipal}`);

    return () => {
      document.title = 'Gradly';
    };
  }, [loadingInitial, tituloPrincipal, subtitulo]);

  const handleExportCalendar = () => {
    const count = countExportableClasses(visibleDays, selectedGroupFilter);
    if (count === 0) {
      alert('Nenhuma aula no grupo selecionado para exportar.');
      return;
    }
    const ics = generateICS(visibleDays, selectedGroupFilter, eventos);
    downloadICS(ics);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
          <span className="text-sm text-gray-500 dark:text-zinc-500">Carregando...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300 max-w-md mx-auto">
      {/* Header: Logo, Títulos, Dark Mode, Menu */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-5 pt-12 pb-5"
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
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-2.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Opções"
              title="Opções"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.header>

      <StudentMenuModal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        groups={groups}
        selectedGroupFilter={selectedGroupFilter}
        setSelectedGroupFilter={setSelectedGroupFilter}
        platformUrl={platformUrl}
        googleDriveUrl={googleDriveUrl}
        onExportCalendar={handleExportCalendar}
        onOpenEvents={() => setEventsTimelineOpen(true)}
        futureEventsCount={futureEventsCount}
      />
      <EventsTimelineModal isOpen={eventsTimelineOpen} onClose={() => setEventsTimelineOpen(false)} />

      {/* Seletor de Dias */}
      <div className="px-5 mb-5">
        <DaySelector
          days={visibleDays}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Cards de Aula */}
      <div className="px-5 pb-6">
        <ScheduleList day={selectedDay} selectedGroupFilter={selectedGroupFilter} />
      </div>

      <Footer />
    </div>
  );
}
