import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  initialScheduleWithWeekend,
  getInitialDayId,
  createEmptySchedule,
  type ClassItem,
  type DaySchedule,
  type ClassType,
} from '../data/schedule';
import { supabaseClient } from '../lib/supabase';
import { useTurma } from './TurmaContext';

const SUPABASE_ENABLED = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type EventoTipo = 'Prova' | 'Trabalho' | 'Outros';

export interface EventoItem {
  id: string;
  titulo: string;
  materia: string;
  data: string;
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
  loadingInitial: boolean;
  savingMessage: string | null;
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
  saveConfig: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const defaultConfig = {
  titulo: 'Horários Medicina',
  subtitulo: '4º Año — Grupo C.1',
  link_drive: 'https://drive.google.com',
  link_plataforma: 'https://campus.upe.edu.py:86/moodle/my/courses.php',
  ativar_sabado: false,
  ativar_domingo: false,
  array_de_grupos: ['Grupo C.1'],
};

function mapAulaToClassItem(row: {
  id: string;
  materia: string;
  horario: string;
  sala: string;
  professor: string;
  tipo: string;
  grupo_alvo: string;
}): ClassItem {
  return {
    id: row.id,
    subject: row.materia ?? '',
    time: row.horario ?? '',
    location: row.sala ?? '',
    professor: row.professor ?? '',
    type: (row.tipo as ClassType) ?? 'teoria',
    grupoAlvo: row.grupo_alvo ?? 'Todos',
  };
}

function mapClassItemToAulaRow(dayId: string, c: ClassItem) {
  return {
    dia_semana: dayId,
    materia: c.subject,
    horario: c.time,
    sala: c.location,
    professor: c.professor,
    tipo: c.type,
    grupo_alvo: c.grupoAlvo,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { turmaId } = useTurma();

  const [schedule, setSchedule] = useState<DaySchedule[]>(initialScheduleWithWeekend);
  const [tituloPrincipal, setTituloPrincipalState] = useState(() => defaultConfig.titulo);
  const [subtitulo, setSubtituloState] = useState(() => defaultConfig.subtitulo);
  const [googleDriveUrl, setGoogleDriveUrlState] = useState(() => defaultConfig.link_drive);
  const [platformUrl, setPlatformUrlState] = useState(() => defaultConfig.link_plataforma);
  const [showSaturday, setShowSaturdayState] = useState(defaultConfig.ativar_sabado);
  const [showSunday, setShowSundayState] = useState(defaultConfig.ativar_domingo);
  const [groups, setGroupsState] = useState<string[]>(() => defaultConfig.array_de_grupos);
  const [eventos, setEventosState] = useState<EventoItem[]>(() => []);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);

  const setSaving = useCallback((msg: string | null) => {
    setSavingMessage(msg);
  }, []);

  useEffect(() => {
    if (!SUPABASE_ENABLED || !turmaId) {
      setLoadingInitial(false);
      return;
    }
    let cancelled = false;
    setLoadingInitial(true);

    async function load() {
      try {
        const [configRes, aulasRes, eventosRes] = await Promise.all([
          supabaseClient.from('configuracoes').select('*').eq('turma_id', turmaId).single(),
          supabaseClient.from('aulas').select('*').eq('turma_id', turmaId).order('dia_semana'),
          supabaseClient.from('eventos').select('*').eq('turma_id', turmaId).order('data', { ascending: true }),
        ]);

        if (cancelled) return;

        if (configRes.data) {
          const c = configRes.data as {
            titulo?: string;
            subtitulo?: string;
            link_drive?: string;
            link_plataforma?: string;
            ativar_sabado?: boolean;
            ativar_domingo?: boolean;
            array_de_grupos?: string[];
          };
          if (c.titulo != null) setTituloPrincipalState(c.titulo);
          if (c.subtitulo != null) setSubtituloState(c.subtitulo);
          if (c.link_drive != null) setGoogleDriveUrlState(c.link_drive);
          if (c.link_plataforma != null) setPlatformUrlState(c.link_plataforma);
          if (c.ativar_sabado != null) setShowSaturdayState(c.ativar_sabado);
          if (c.ativar_domingo != null) setShowSundayState(c.ativar_domingo);
          if (c.array_de_grupos != null && Array.isArray(c.array_de_grupos))
            setGroupsState(c.array_de_grupos);
        } else {
          setTituloPrincipalState(defaultConfig.titulo);
          setSubtituloState(defaultConfig.subtitulo);
          setGoogleDriveUrlState(defaultConfig.link_drive);
          setPlatformUrlState(defaultConfig.link_plataforma);
          setShowSaturdayState(defaultConfig.ativar_sabado);
          setShowSundayState(defaultConfig.ativar_domingo);
          setGroupsState(defaultConfig.array_de_grupos);
        }

        const scheduleFromAulas = createEmptySchedule();
        if (aulasRes.data && Array.isArray(aulasRes.data)) {
          for (const row of aulasRes.data as Array<{
            id: string;
            dia_semana: string;
            materia: string;
            horario: string;
            sala: string;
            professor: string;
            tipo: string;
            grupo_alvo: string;
          }>) {
            const day = scheduleFromAulas.find((d) => d.id === row.dia_semana);
            if (day) day.classes.push(mapAulaToClassItem(row));
          }
        }
        setSchedule(scheduleFromAulas);

        if (eventosRes.data && Array.isArray(eventosRes.data)) {
          const list = (eventosRes.data as Array<{
            id: string;
            titulo: string;
            materia: string;
            data: string;
            pontuacao: string;
            descricao: string;
            tipo: string;
          }>).map((e) => ({
            id: e.id,
            titulo: e.titulo ?? '',
            materia: e.materia ?? '',
            data: typeof e.data === 'string' ? e.data : new Date(e.data).toISOString(),
            pontuacao: e.pontuacao ?? '',
            descricao: e.descricao ?? '',
            tipo: (e.tipo as EventoTipo) ?? 'Prova',
          }));
          setEventosState(list);
        } else {
          setEventosState([]);
        }
      } catch (_) {
        if (!cancelled) setLoadingInitial(false);
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [turmaId]);

  const visibleDays = useMemo(() => {
    const base = schedule.slice(0, 5);
    if (showSaturday) base.push(schedule[5]!);
    if (showSunday) base.push(schedule[6]!);
    return base;
  }, [schedule, showSaturday, showSunday]);

  const persistConfig = useCallback(async () => {
    if (!SUPABASE_ENABLED || !turmaId) return;
    setSaving('Salvando...');
    const { data: existing } = await supabaseClient
      .from('configuracoes')
      .select('id')
      .eq('turma_id', turmaId)
      .maybeSingle();
    if (existing) {
      await supabaseClient.from('configuracoes').update({
        titulo: tituloPrincipal,
        subtitulo,
        link_drive: googleDriveUrl,
        link_plataforma: platformUrl,
        ativar_sabado: showSaturday,
        ativar_domingo: showSunday,
        array_de_grupos: groups,
      }).eq('turma_id', turmaId);
    } else {
      await supabaseClient.from('configuracoes').insert({
        turma_id: turmaId,
        titulo: tituloPrincipal,
        subtitulo,
        link_drive: googleDriveUrl,
        link_plataforma: platformUrl,
        ativar_sabado: showSaturday,
        ativar_domingo: showSunday,
        array_de_grupos: groups,
      });
    }
    setSaving(null);
  }, [
    turmaId,
    tituloPrincipal,
    subtitulo,
    googleDriveUrl,
    platformUrl,
    showSaturday,
    showSunday,
    groups,
  ]);

  const setTituloPrincipal = useCallback(
    (v: string) => {
      setTituloPrincipalState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ titulo: v }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const setSubtitulo = useCallback(
    (v: string) => {
      setSubtituloState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ subtitulo: v }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const setGoogleDriveUrl = useCallback(
    (url: string) => {
      setGoogleDriveUrlState(url);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ link_drive: url }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const setPlatformUrl = useCallback(
    (v: string) => {
      setPlatformUrlState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ link_plataforma: v }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const setShowSaturday = useCallback(
    (v: boolean) => {
      setShowSaturdayState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ ativar_sabado: v }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const setShowSunday = useCallback(
    (v: boolean) => {
      setShowSundayState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ ativar_domingo: v }).eq('turma_id', turmaId).then(() => setSaving(null));
      }
    },
    [turmaId]
  );

  const addGroup = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setGroupsState((prev) => {
        const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
        if (SUPABASE_ENABLED && turmaId) {
          setSaving('Salvando...');
          supabaseClient.from('configuracoes').update({ array_de_grupos: next }).eq('turma_id', turmaId).then(() => setSaving(null));
        }
        return next;
      });
    },
    [turmaId]
  );

  const removeGroup = useCallback(
    (name: string) => {
      setGroupsState((prev) => {
        const next = prev.filter((g) => g !== name);
        setSchedule((s) =>
          s.map((d) => ({
            ...d,
            classes: d.classes.map((c) =>
              c.grupoAlvo === name ? { ...c, grupoAlvo: 'Todos' } : c
            ),
          }))
        );
        if (SUPABASE_ENABLED && turmaId) {
          setSaving('Salvando...');
          Promise.all([
            supabaseClient.from('configuracoes').update({ array_de_grupos: next }).eq('turma_id', turmaId),
            supabaseClient.from('aulas').update({ grupo_alvo: 'Todos' }).eq('grupo_alvo', name).eq('turma_id', turmaId),
          ]).finally(() => setSaving(null));
        }
        return next;
      });
    },
    [turmaId]
  );

  const addEvento = useCallback(async (item: Omit<EventoItem, 'id'>) => {
    if (SUPABASE_ENABLED && turmaId) {
      setSaving('Salvando...');
      const { data, error } = await supabaseClient.from('eventos').insert({
        turma_id: turmaId,
        titulo: item.titulo,
        materia: item.materia,
        data: item.data,
        pontuacao: item.pontuacao,
        descricao: item.descricao,
        tipo: item.tipo,
      }).select('id').single();
      setSaving(null);
      if (!error && data) {
        setEventosState((prev) => [...prev, { ...item, id: data.id }]);
        return;
      }
    }
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setEventosState((prev) => [...prev, { ...item, id }]);
  }, [turmaId]);

  const removeEvento = useCallback(
    async (id: string) => {
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        await supabaseClient.from('eventos').delete().eq('id', id).eq('turma_id', turmaId);
        setSaving(null);
      }
      setEventosState((prev) => prev.filter((e) => e.id !== id));
    },
    [turmaId]
  );

  const updateDayClasses = useCallback((dayId: string, classes: ClassItem[]) => {
    setSchedule((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, classes } : d))
    );
  }, []);

  const addClass = useCallback(
    async (dayId: string, classItem: ClassItem) => {
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        const row = { ...mapClassItemToAulaRow(dayId, classItem), turma_id: turmaId };
        const { data, error } = await supabaseClient.from('aulas').insert(row).select('id').single();
        setSaving(null);
        if (!error && data) {
          setSchedule((prev) =>
            prev.map((d) =>
              d.id === dayId
                ? { ...d, classes: [...d.classes, { ...classItem, id: data.id }] }
                : d
            )
          );
          return;
        }
      }
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, classes: [...d.classes, classItem] } : d
        )
      );
    },
    [turmaId]
  );

  const removeClass = useCallback(
    async (dayId: string, index: number) => {
      const day = schedule.find((d) => d.id === dayId);
      const cls = day?.classes[index];
      if (SUPABASE_ENABLED && turmaId && cls?.id) {
        setSaving('Salvando...');
        await supabaseClient.from('aulas').delete().eq('id', cls.id).eq('turma_id', turmaId);
        setSaving(null);
      }
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, classes: d.classes.filter((_, i) => i !== index) } : d
        )
      );
    },
    [schedule, turmaId]
  );

  const updateClass = useCallback(
    async (dayId: string, index: number, classItem: Partial<ClassItem>) => {
      const day = schedule.find((d) => d.id === dayId);
      const current = day?.classes[index];
      if (!current) return;

      if (SUPABASE_ENABLED && turmaId && current.id) {
        setSaving('Salvando...');
        const row: Record<string, unknown> = {};
        if (classItem.subject != null) row.materia = classItem.subject;
        if (classItem.time != null) row.horario = classItem.time;
        if (classItem.location != null) row.sala = classItem.location;
        if (classItem.professor != null) row.professor = classItem.professor;
        if (classItem.type != null) row.tipo = classItem.type;
        if (classItem.grupoAlvo != null) row.grupo_alvo = classItem.grupoAlvo;
        if (Object.keys(row).length > 0) {
          await supabaseClient.from('aulas').update(row).eq('id', current.id).eq('turma_id', turmaId);
        }
        setSaving(null);
      }

      setSchedule((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const next = [...d.classes];
          if (next[index]) next[index] = { ...next[index]!, ...classItem };
          return { ...d, classes: next };
        })
      );
    },
    [schedule, turmaId]
  );

  const saveConfig = useCallback(async () => {
    await persistConfig();
  }, [persistConfig]);

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
      loadingInitial,
      savingMessage,
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
      saveConfig,
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
      loadingInitial,
      savingMessage,
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
      saveConfig,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
