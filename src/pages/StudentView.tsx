import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const SPLASH_MIN_DURATION_MS = 2800; // Garante animação do logo + tempo para turma e schedule carregarem
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DaySelector } from '../components/DaySelector';
import { ScheduleList } from '../components/ScheduleList';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { StudentMenuModal } from '../components/StudentMenuModal';
import { EventsTimelineModal } from '../components/EventsTimelineModal';
import { SubjectDetailsModal } from '../components/SubjectDetailsModal';
import { InstallPrompt } from '../components/InstallPrompt';
import { SplashScreenLoader } from '../components/SplashScreenLoader';
import type { ClassItem } from '../data/schedule';
import { FILTER_TODOS } from '../components/GroupFilter';

const GRUPO_STORAGE_PREFIX = 'gradly-grupo-';

function getStoredGrupo(slug: string): string | null {
  try {
    return localStorage.getItem(GRUPO_STORAGE_PREFIX + slug);
  } catch {
    return null;
  }
}

function setStoredGrupo(slug: string, grupo: string) {
  try {
    if (!grupo || grupo === FILTER_TODOS) {
      localStorage.removeItem(GRUPO_STORAGE_PREFIX + slug);
    } else {
      localStorage.setItem(GRUPO_STORAGE_PREFIX + slug, grupo);
    }
  } catch {
    /* ignore */
  }
}
import { generateICS, downloadICS, countExportableClasses } from '../utils/generateICS';
import { diasAteEvento } from '../utils/eventos';

export function StudentView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { visibleDays, tituloPrincipal, subtitulo, googleDriveUrl, platformUrl, getInitialDayId, groups, eventos, loadingInitial } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsTimelineOpen, setEventsTimelineOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ClassItem | null>(null);

  const futureEventsCount = useMemo(
    () => eventos.filter((e) => diasAteEvento(e.data) >= 0).length,
    [eventos]
  );
  const [selectedId, setSelectedId] = useState<string>(() => getInitialDayId());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [splashMinTimeReached, setSplashMinTimeReached] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const grupoFromUrl = searchParams.get('grupo');
  const [selectedGroupFilter, setSelectedGroupFilterState] = useState<string>(() => {
    const g = grupoFromUrl ?? getStoredGrupo(slug ?? '') ?? '';
    if (!g || g === FILTER_TODOS) return FILTER_TODOS;
    return g;
  });
  const selectedDay = visibleDays.find((d) => d.id === selectedId) ?? visibleDays[0];

  const setSelectedGroupFilter = useCallback(
    (value: string) => {
      setSelectedGroupFilterState(value);
      if (slug) setStoredGrupo(slug, value);
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

  // Sincronizar grupo da URL com o state e localStorage; restaurar grupo salvo quando URL não tem (ex.: PWA abre sem query)
  useEffect(() => {
    const g = searchParams.get('grupo');
    // URL sem grupo ou com grupo=TODOS → exibir "Todos" (após verificar se deve restaurar stored)
    if (!g || g === FILTER_TODOS) {
      if (!loadingInitial && slug && groups.length > 0) {
        const stored = getStoredGrupo(slug);
        if (stored && groups.includes(stored)) {
          navigate(`/t/${slug}?grupo=${encodeURIComponent(stored)}`, { replace: true });
          setSelectedGroupFilterState(stored);
          return;
        }
      }
      if (selectedGroupFilter !== FILTER_TODOS) {
        setSelectedGroupFilterState(FILTER_TODOS);
      }
      if (slug) setStoredGrupo(slug, FILTER_TODOS);
      return;
    }
    if (slug) setStoredGrupo(slug, g);
    if (groups.length > 0 && groups.includes(g) && selectedGroupFilter !== g) {
      setSelectedGroupFilterState(g);
    }
  }, [searchParams, groups, loadingInitial, slug, navigate, selectedGroupFilter]);

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

  // Atualiza o manifest link quando a URL muda (ex.: usuário seleciona grupo) — assim o "Adicionar à tela inicial" salva a URL com o grupo correto
  useEffect(() => {
    const p = location.pathname + location.search;
    if (!p.startsWith('/t/')) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (link) link.href = '/api/manifest?start_url=' + encodeURIComponent(p);
  }, [location.pathname, location.search]);

  // Garante que o splash fique visível pelo tempo mínimo (animação do logo)
  useEffect(() => {
    const t = setTimeout(() => setSplashMinTimeReached(true), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const showSplash = loadingInitial || !splashMinTimeReached;

  const MIN_SWIPE_DISTANCE = 50;

  const handleDayChangeBySwipe = useCallback(
    (direction: 'left' | 'right') => {
      const idx = visibleDays.findIndex((d) => d.id === selectedId);
      if (idx < 0) return;
      const nextIdx = direction === 'left' ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= visibleDays.length) return;
      setSwipeDirection(direction);
      setSelectedId(visibleDays[nextIdx].id);
    },
    [visibleDays, selectedId]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStartRef.current.x;
      const deltaY = touchEnd.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return;

      if (deltaX < 0) handleDayChangeBySwipe('left');
      else handleDayChangeBySwipe('right');
    },
    [handleDayChangeBySwipe]
  );

  const updateScrollState = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setIsAtTop(scrollTop <= 10);
    setIsAtBottom(Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    updateScrollState(e.target as HTMLDivElement);
  }, [updateScrollState]);

  // Atualiza estado do scroll ao montar e quando o dia/conteúdo mudar
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState(el);
    const ro = new ResizeObserver(() => updateScrollState(el));
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedDay, updateScrollState]);

  const handleExportCalendar = () => {
    const count = countExportableClasses(visibleDays, selectedGroupFilter);
    if (count === 0) {
      alert('Nenhuma aula no grupo selecionado para exportar.');
      return;
    }
    const ics = generateICS(visibleDays, selectedGroupFilter, eventos);
    downloadICS(ics);
  };

  const bgClasses = 'bg-[#f8f7f5] dark:bg-zinc-950';

  return (
    <>
    {!showSplash && (
    <div
      className={`flex flex-col h-[100dvh] overflow-hidden ${bgClasses} transition-colors duration-300 max-w-md mx-auto md:h-auto md:min-h-screen md:overflow-visible`}
    >
      {/* Topo fixo: Header + Seletor de Dias */}
      <div className={`flex-shrink-0 z-20 ${bgClasses} pt-[max(env(safe-area-inset-top),1.5rem)] pb-2`}>
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="px-5 pt-6 pb-4"
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

        {/* Seletor de Dias */}
        <div className="px-5 mb-4">
          <DaySelector
            days={visibleDays}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

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

      {/* Área central rolável com fade nas extremidades */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden md:overflow-visible md:min-h-0">
        {/* Gradiente superior — opacidade 0 no topo para não sobrepor o primeiro card */}
        <div
          className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#f8f7f5] to-transparent dark:from-zinc-950 pointer-events-none z-10 transition-opacity duration-300 ${isAtTop ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden
        />
        {/* Gradiente inferior — opacidade 0 no fim do scroll */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f8f7f5] to-transparent dark:from-zinc-950 pointer-events-none z-10 transition-opacity duration-300 ${isAtBottom ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden
        />
        {/* Contêiner de scroll — cards das matérias + swipe */}
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto px-4 md:px-0 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ScheduleList
            day={selectedDay}
            selectedGroupFilter={selectedGroupFilter}
            onCardClick={(item) => setSelectedSubject(item)}
            swipeDirection={swipeDirection}
            onSwipeAnimationComplete={() => setSwipeDirection(null)}
          />
        </div>
      </div>

      {/* Rodapé fixo compacto */}
      <div className={`flex-shrink-0 z-20 ${bgClasses} pt-2 pb-[max(env(safe-area-inset-bottom),16px)] flex justify-center items-center`}>
        <Footer compact />
      </div>
    </div>
    )}

    <AnimatePresence>
      {showSplash && <SplashScreenLoader key="splash" />}
    </AnimatePresence>
    </>
  );
}
