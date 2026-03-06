import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  initialScheduleWithWeekend,
  getInitialDayId,
  type ClassItem,
  type DaySchedule,
} from '../data/schedule';

export type EventoTipo = 'Prova' | 'Trabalho' | 'Outros';

export interface EventoItem {
  id: string;
  titulo: string;
  materia: string;
  data: string; // ISO
  pontuacao: string;
  descricao: string;
  tipo: EventoTipo;
}

export interface AppState {
  schedule: DaySchedule[];
  tituloPrincipal: string;
  subtitulo: string;
  googleDriveUrl: string;
  platformUrl: string;
  showSaturday: boolean;
  showSunday: boolean;
  groups: string[];
  eventos: EventoItem[];
}

interface AppContextValue extends AppState {
  visibleDays: DaySchedule[];
  setTituloPrincipal: (v: string) => void;
  setSubtitulo: (v: string) => void;
  setGoogleDriveUrl: (url: string) => void;
  setPlatformUrl: (url: string) => void;
  setShowSaturday: (v: boolean) => void;
  setShowSunday: (v: boolean) => void;
  addGroup: (name: string) => void;
  removeGroup: (name: string) => void;
  addEvento: (item: Omit<EventoItem, 'id'>) => void;
  removeEvento: (id: string) => void;
  updateDayClasses: (dayId: string, classes: ClassItem[]) => void;
  addClass: (dayId: string, classItem: ClassItem) => void;
  removeClass: (dayId: string, index: number) => void;
  updateClass: (dayId: string, index: number, classItem: Partial<ClassItem>) => void;
  getInitialDayId: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialScheduleWithWeekend);
  const [tituloPrincipal, setTituloPrincipalState] = useState(() => 'Horários Medicina');
  const [subtitulo, setSubtituloState] = useState(() => '4º Año — Grupo C.1');
  const [googleDriveUrl, setGoogleDriveUrlState] = useState(
    () => 'https://drive.google.com'
  );
  const [platformUrl, setPlatformUrlState] = useState(
    () => 'https://campus.upe.edu.py:86/moodle/my/courses.php'
  );
  const [showSaturday, setShowSaturdayState] = useState(false);
  const [showSunday, setShowSundayState] = useState(false);
  const [groups, setGroupsState] = useState<string[]>(() => ['Grupo C.1']);
  const [eventos, setEventosState] = useState<EventoItem[]>(() => []);

  const setTituloPrincipal = useCallback((v: string) => setTituloPrincipalState(v), []);
  const setSubtitulo = useCallback((v: string) => setSubtituloState(v), []);
  const setPlatformUrl = useCallback((v: string) => setPlatformUrlState(v), []);

  const visibleDays = useMemo(() => {
    const base = schedule.slice(0, 5);
    if (showSaturday) base.push(schedule[5]!);
    if (showSunday) base.push(schedule[6]!);
    return base;
  }, [schedule, showSaturday, showSunday]);

  const setGoogleDriveUrl = useCallback((url: string) => {
    setGoogleDriveUrlState(url);
  }, []);

  const setShowSaturday = useCallback((v: boolean) => {
    setShowSaturdayState(v);
  }, []);

  const setShowSunday = useCallback((v: boolean) => {
    setShowSundayState(v);
  }, []);

  const addGroup = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setGroupsState((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  const removeGroup = useCallback((name: string) => {
    setGroupsState((prev) => prev.filter((g) => g !== name));
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        classes: d.classes.map((c) =>
          c.grupoAlvo === name ? { ...c, grupoAlvo: 'Todos' } : c
        ),
      }))
    );
  }, []);

  const addEvento = useCallback((item: Omit<EventoItem, 'id'>) => {
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setEventosState((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeEvento = useCallback((id: string) => {
    setEventosState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateDayClasses = useCallback((dayId: string, classes: ClassItem[]) => {
    setSchedule((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, classes } : d))
    );
  }, []);

  const addClass = useCallback((dayId: string, classItem: ClassItem) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, classes: [...d.classes, classItem] }
          : d
      )
    );
  }, []);

  const removeClass = useCallback((dayId: string, index: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, classes: d.classes.filter((_, i) => i !== index) }
          : d
      )
    );
  }, []);

  const updateClass = useCallback(
    (dayId: string, index: number, classItem: Partial<ClassItem>) => {
      setSchedule((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const next = [...d.classes];
          if (next[index]) next[index] = { ...next[index]!, ...classItem };
          return { ...d, classes: next };
        })
      );
    },
    []
  );

  const value = useMemo<AppContextValue>(
    () => ({
      schedule,
      tituloPrincipal,
      subtitulo,
      googleDriveUrl,
      platformUrl,
      showSaturday,
      showSunday,
      groups,
      eventos,
      visibleDays,
      setTituloPrincipal,
      setSubtitulo,
      setGoogleDriveUrl,
      setPlatformUrl,
      setShowSaturday,
      setShowSunday,
      addGroup,
      removeGroup,
      addEvento,
      removeEvento,
      updateDayClasses,
      addClass,
      removeClass,
      updateClass,
      getInitialDayId,
    }),
    [
      schedule,
      tituloPrincipal,
      subtitulo,
      googleDriveUrl,
      platformUrl,
      showSaturday,
      showSunday,
      groups,
      eventos,
      visibleDays,
      setTituloPrincipal,
      setSubtitulo,
      setGoogleDriveUrl,
      setPlatformUrl,
      setShowSaturday,
      setShowSunday,
      addGroup,
      removeGroup,
      addEvento,
      removeEvento,
      updateDayClasses,
      addClass,
      removeClass,
      updateClass,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
