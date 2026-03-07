import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { ScheduleList } from '../components/ScheduleList';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { StudentMenuModal } from '../components/StudentMenuModal';
import { EventsTimelineModal } from '../components/EventsTimelineModal';
import { SubjectDetailsModal } from '../components/SubjectDetailsModal';
import { InstallPrompt } from '../components/InstallPrompt';
import type { ClassItem } from '../data/schedule';
import { FILTER_TODOS } from '../components/GroupFilter';
import { generateICS, downloadICS, countExportableClasses } from '../utils/generateICS';
import { diasAteEvento } from '../utils/eventos';

export function StudentView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { visibleDays, tituloPrincipal, subtitulo, googleDriveUrl, platformUrl, getInitialDayId, groups, eventos, loadingInitial } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsTimelineOpen, setEventsTimelineOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ClassItem | null>(null);

  const futureEventsCount = useMemo(
    () => eventos.filter((e) => diasAteEvento(e.data) >= 0).length,
    [eventos]
  );
  const [selectedId, setSelectedId] = useState<string>(() => getInitialDayId());
  const grupoFromUrl = searchParams.get('grupo');
  const [selectedGroupFilter, setSelectedGroupFilterState] = useState<string>(() => {
    const g = grupoFromUrl ?? '';
    if (!g || g === FILTER_TODOS) return FILTER_TODOS;
    return g;
  });
  const selectedDay = visibleDays.find((d) => d.id === selectedId) ?? visibleDays[0];

  const setSelectedGroupFilter = useCallback(
    (value: string) => {
      setSelectedGroupFilterState(value);
      const base = slug ? `/t/${slug}` : window.location.pathname;
      const url = value !== FILTER_TODOS && value
        ? `${base}?grupo=${encodeURIComponent(value)}`
        : base;
      navigate(url, { replace: true });
    },
    [navigate, slug]
  );

  useEffect(() => {
    if (visibleDays.length > 0 && !visibleDays.some((d) => d.id === selectedId)) {
      setSelectedId(visibleDays[0].id);
    }
  }, [visibleDays, selectedId]);

  // Sincronizar grupo da URL com o state (ex.: ao carregar ou ao voltar)
  useEffect(() => {
    const g = searchParams.get('grupo');
    if (!g || g === FILTER_TODOS) {
      if (selectedGroupFilter !== FILTER_TODOS) setSelectedGroupFilterState(FILTER_TODOS);
      return;
    }
    if (groups.length > 0 && groups.includes(g) && selectedGroupFilter !== g) {
      setSelectedGroupFilterState(g);
    }
  }, [searchParams, groups]);

  useEffect(() => {
    if (
      selectedGroupFilter !== FILTER_TODOS &&
      groups.length > 0 &&
      !groups.includes(selectedGroupFilter)
    ) {
      setSelectedGroupFilterState(FILTER_TODOS);
      const base = slug ? `/t/${slug}` : window.location.pathname;
      navigate(base, { replace: true });
    }
  }, [groups, selectedGroupFilter, navigate, slug]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),2rem)]">
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
    <div
      className="min-h-screen bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300 max-w-md mx-auto pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),2rem)]"
    >
      {/* Header: Logo, Títulos, Dark Mode, Menu */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-5 pt-6 pb-7"
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
      <InstallPrompt />
      <SubjectDetailsModal
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        item={selectedSubject}
        eventos={eventos}
      />

      {/* Seletor de Dias */}
      <div className="px-5 mb-8">
        <DaySelector
          days={visibleDays}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Cards de Aula */}
      <div className="px-5 pb-4">
        <ScheduleList
          day={selectedDay}
          selectedGroupFilter={selectedGroupFilter}
          onCardClick={(item) => setSelectedSubject(item)}
        />
      </div>

      <Footer />
    </div>
  );
}
