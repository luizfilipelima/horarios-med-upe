import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getInitialDayId,
  createEmptySchedule,
  formatTimeRange,
  removeGroupFromGrupoAlvo,
  parseGruposAlvo,
  applyDayLabels,
  type ClassItem,
  type DaySchedule,
  type ClassType,
  type IdiomaDias,
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
  idiomaDias: IdiomaDias;
  groups: string[];
  eventos: EventoItem[];
}

interface AppContextValue extends AppState {
  visibleDays: DaySchedule[];
  loadingInitial: boolean;
  savingMessage: string | null;
  toast: string | null;
  showToast: (message: string) => void;
  setTituloPrincipal: (v: string) => void;
  setSubtitulo: (v: string) => void;
  setGoogleDriveUrl: (url: string) => void;
  setPlatformUrl: (url: string) => void;
  setShowSaturday: (v: boolean) => void;
  setShowSunday: (v: boolean) => void;
  setIdiomaDias: (v: IdiomaDias) => void;
  addGroup: (name: string) => void;
  removeGroup: (name: string) => void;
  addEvento: (item: Omit<EventoItem, 'id'>) => void;
  updateEvento: (id: string, item: Partial<Omit<EventoItem, 'id'>>) => void;
  removeEvento: (id: string) => void;
  updateDayClasses: (dayId: string, classes: ClassItem[]) => void;
  addClass: (dayId: string, classItem: ClassItem) => void;
  removeClass: (dayId: string, index: number) => void;
  updateClass: (dayId: string, index: number, classItem: Partial<ClassItem>) => void;
  addAula: (aula: Omit<ClassItem, 'id'> & { dia_semana: string }) => void;
  updateAulaById: (id: string, partial: Partial<ClassItem> & { dia_semana?: string }) => void;
  removeAulaById: (id: string) => void;
  moveClass: (dayId: string, fromIndex: number, direction: 'up' | 'down') => void;
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

interface AulaRow {
  id: string;
  dia_semana: string;
  materia: string;
  horario?: string;
  horario_inicio?: string;
  horario_fim?: string;
  sala: string;
  professor: string;
  tipo: string;
  grupo_alvo: string;
}

function parseHorario(horario: string): { inicio: string; fim: string } | null {
  if (!horario || !horario.includes('-')) return null;
  const parts = horario.split(/-/).map((p) => p.trim());
  if (parts.length >= 2 && parts[0] && parts[1]) return { inicio: parts[0], fim: parts[1] };
  return null;
}

function mapAulaToClassItem(row: AulaRow): ClassItem {
  const inicio = row.horario_inicio ?? parseHorario(row.horario ?? '')?.inicio ?? '08:00';
  const fim = row.horario_fim ?? parseHorario(row.horario ?? '')?.fim ?? '10:00';
  const time = formatTimeRange(inicio, fim);
  return {
    id: row.id,
    subject: row.materia ?? '',
    time,
    horarioInicio: inicio,
    horarioFim: fim,
    location: row.sala ?? '',
    professor: row.professor ?? '',
    type: (row.tipo as ClassType) ?? 'teoria',
    grupoAlvo: row.grupo_alvo ?? 'Todos',
  };
}

function mapClassItemToAulaRow(dayId: string, c: ClassItem, ordem: number) {
  const inicio = c.horarioInicio ?? parseHorario(c.time)?.inicio ?? '08:00';
  const fim = c.horarioFim ?? parseHorario(c.time)?.fim ?? '10:00';
  return {
    dia_semana: dayId,
    materia: c.subject,
    horario: formatTimeRange(inicio, fim),
    horario_inicio: inicio,
    horario_fim: fim,
    sala: c.location,
    professor: c.professor,
    tipo: c.type,
    grupo_alvo: c.grupoAlvo,
    ordem,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { turmaId } = useTurma();

  const [schedule, setSchedule] = useState<DaySchedule[]>(() => createEmptySchedule());
  const [tituloPrincipal, setTituloPrincipalState] = useState(() => defaultConfig.titulo);
  const [subtitulo, setSubtituloState] = useState(() => defaultConfig.subtitulo);
  const [googleDriveUrl, setGoogleDriveUrlState] = useState(() => defaultConfig.link_drive);
  const [platformUrl, setPlatformUrlState] = useState(() => defaultConfig.link_plataforma);
  const [showSaturday, setShowSaturdayState] = useState(defaultConfig.ativar_sabado);
  const [showSunday, setShowSundayState] = useState(defaultConfig.ativar_domingo);
  const [idiomaDias, setIdiomaDiasState] = useState<IdiomaDias>('es');
  const [groups, setGroupsState] = useState<string[]>(() => defaultConfig.array_de_grupos);
  const [eventos, setEventosState] = useState<EventoItem[]>(() => []);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSaving = useCallback((msg: string | null) => {
    setSavingMessage(msg);
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(message);
    toastRef.current = setTimeout(() => {
      setToast(null);
      toastRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    if (!SUPABASE_ENABLED || !turmaId) {
      setLoadingInitial(false);
      return;
    }
    let cancelled = false;
    setLoadingInitial(true);
    // Reset config para não exibir dados da turma anterior enquanto carrega
    setTituloPrincipalState('');
    setSubtituloState('');
    setGroupsState([]);

    async function load() {
      try {
        const [configRes, aulasRes, eventosRes] = await Promise.all([
          supabaseClient.from('configuracoes').select('*').eq('turma_id', turmaId).single(),
          supabaseClient.from('aulas').select('*').eq('turma_id', turmaId).order('dia_semana', { ascending: true }).order('ordem', { ascending: true }),
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
            idioma_dias?: string;
            array_de_grupos?: string[];
          };
          if (c.titulo != null) setTituloPrincipalState(c.titulo);
          if (c.subtitulo != null) setSubtituloState(c.subtitulo);
          if (c.link_drive != null) setGoogleDriveUrlState(c.link_drive);
          if (c.link_plataforma != null) setPlatformUrlState(c.link_plataforma);
          if (c.ativar_sabado != null) setShowSaturdayState(c.ativar_sabado);
          if (c.ativar_domingo != null) setShowSundayState(c.ativar_domingo);
          if (c.idioma_dias === 'pt' || c.idioma_dias === 'es') setIdiomaDiasState(c.idioma_dias);
          if (c.array_de_grupos != null && Array.isArray(c.array_de_grupos))
            setGroupsState(c.array_de_grupos);
        } else {
          // Turma sem config: usar valores neutros, não da primeira turma
          setTituloPrincipalState('');
          setSubtituloState('');
          setGoogleDriveUrlState('');
          setPlatformUrlState('');
          setShowSaturdayState(false);
          setShowSundayState(false);
          setIdiomaDiasState('es');
          setGroupsState([]);
        }

        const scheduleFromAulas = createEmptySchedule();
        if (aulasRes.data && Array.isArray(aulasRes.data)) {
          const rows = aulasRes.data as AulaRow[];
          for (const day of scheduleFromAulas) {
            const aulasDoDia = rows
              .filter((r) => r.dia_semana === day.id)
              .sort((a, b) => {
                const ta = a.horario_inicio ?? parseHorario(a.horario ?? '')?.inicio ?? '00:00';
                const tb = b.horario_inicio ?? parseHorario(b.horario ?? '')?.inicio ?? '00:00';
                return ta.localeCompare(tb);
              });
            day.classes = aulasDoDia.map(mapAulaToClassItem);
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
    return applyDayLabels(base, idiomaDias);
  }, [schedule, showSaturday, showSunday, idiomaDias]);

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
        idioma_dias: idiomaDias,
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
        idioma_dias: idiomaDias,
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
    idiomaDias,
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

  const setIdiomaDias = useCallback(
    (v: IdiomaDias) => {
      setIdiomaDiasState(v);
      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        supabaseClient.from('configuracoes').update({ idioma_dias: v }).eq('turma_id', turmaId).then(() => setSaving(null));
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
            classes: d.classes.map((c) => {
              if (!parseGruposAlvo(c.grupoAlvo).includes(name)) return c;
              return { ...c, grupoAlvo: removeGroupFromGrupoAlvo(c.grupoAlvo, name) };
            }),
          }))
        );
        if (SUPABASE_ENABLED && turmaId) {
          setSaving('Salvando...');
          supabaseClient.from('configuracoes').update({ array_de_grupos: next }).eq('turma_id', turmaId).then(() => setSaving(null));
          supabaseClient
            .from('aulas')
            .select('id, grupo_alvo')
            .eq('turma_id', turmaId)
            .then(({ data }) => {
              if (!data) {
                setSaving(null);
                return;
              }
              const updates = data
                .filter((row) => parseGruposAlvo(row.grupo_alvo).includes(name))
                .map((row) =>
                  supabaseClient.from('aulas').update({ grupo_alvo: removeGroupFromGrupoAlvo(row.grupo_alvo, name) }).eq('id', row.id).eq('turma_id', turmaId)
                );
              Promise.all(updates).then(() => setSaving(null));
            });
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

  const updateEvento = useCallback(
    async (id: string, item: Partial<Omit<EventoItem, 'id'>>) => {
      const updates: Record<string, unknown> = {};
      if (item.titulo != null) updates.titulo = item.titulo;
      if (item.materia != null) updates.materia = item.materia;
      if (item.data != null) updates.data = item.data;
      if (item.pontuacao != null) updates.pontuacao = item.pontuacao;
      if (item.descricao != null) updates.descricao = item.descricao;
      if (item.tipo != null) updates.tipo = item.tipo;
      if (Object.keys(updates).length === 0) return;

      if (SUPABASE_ENABLED && turmaId) {
        setSaving('Salvando...');
        await supabaseClient.from('eventos').update(updates).eq('id', id).eq('turma_id', turmaId);
        setSaving(null);
      }
      setEventosState((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...item } : e))
      );
    },
    [turmaId]
  );

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

  const updateAulaById = useCallback(
    async (id: string, partial: Partial<ClassItem> & { dia_semana?: string }) => {
      let found: { dayId: string; index: number; item: ClassItem } | null = null;
      for (const day of schedule) {
        const idx = day.classes.findIndex((c) => c.id === id);
        if (idx >= 0) {
          found = { dayId: day.id, index: idx, item: day.classes[idx]! };
          break;
        }
      }
      if (!found) return;
      const { dia_semana: newDia, ...rest } = partial;
      const merged: ClassItem = {
        ...found.item,
        ...rest,
        horarioInicio: rest.horarioInicio ?? found.item.horarioInicio ?? parseHorario(found.item.time)?.inicio ?? '08:00',
        horarioFim: rest.horarioFim ?? found.item.horarioFim ?? parseHorario(found.item.time)?.fim ?? '10:00',
      };
      merged.time = formatTimeRange(merged.horarioInicio!, merged.horarioFim!);

      const needMove = newDia && newDia !== found.dayId;
      if (needMove) {
        const remaining = schedule.find((d) => d.id === found!.dayId)!.classes.filter((_, i) => i !== found!.index);
        const newDayClasses = [...(schedule.find((d) => d.id === newDia)!.classes), { ...merged, id: found.item.id }];
        setSchedule((prev) =>
          prev.map((d) => {
            if (d.id === found!.dayId) return { ...d, classes: remaining };
            if (d.id === newDia) return { ...d, classes: newDayClasses.sort((a, b) => (a.horarioInicio ?? '00:00').localeCompare(b.horarioInicio ?? '00:00')) };
            return d;
          })
        );
      } else {
        setSchedule((prev) =>
          prev.map((d) => {
            if (d.id !== found!.dayId) return d;
            const next = [...d.classes];
            if (next[found!.index]) next[found!.index] = { ...next[found!.index]!, ...merged };
            return { ...d, classes: next };
          })
        );
      }

      if (!SUPABASE_ENABLED || !turmaId || String(found.item.id).startsWith('temp-')) return;
      const row: Record<string, unknown> = {
        materia: merged.subject,
        horario: merged.time,
        horario_inicio: merged.horarioInicio,
        horario_fim: merged.horarioFim,
        sala: merged.location,
        professor: merged.professor,
        tipo: merged.type,
        grupo_alvo: merged.grupoAlvo,
      };
      if (needMove && newDia) row.dia_semana = newDia;
      supabaseClient.from('aulas').update(row).eq('id', found.item.id).eq('turma_id', turmaId).then(({ error }) => {
        if (error) showToast('Falha ao salvar. Tente novamente.');
      });
    },
    [schedule, turmaId, showToast]
  );

  const moveClass = useCallback(
    async (dayId: string, fromIndex: number, direction: 'up' | 'down') => {
      const day = schedule.find((d) => d.id === dayId);
      if (!day || day.classes.length < 2) return;
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= day.classes.length) return;

      const itemFrom = day.classes[fromIndex];
      const itemTo = day.classes[toIndex];
      const idFrom = itemFrom?.id;
      const idTo = itemTo?.id;

      setSchedule((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const next = [...d.classes];
          const [removed] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, removed);
          return { ...d, classes: next };
        })
      );

      if (
        SUPABASE_ENABLED &&
        turmaId &&
        idFrom &&
        idTo &&
        !String(idFrom).startsWith('temp-') &&
        !String(idTo).startsWith('temp-')
      ) {
        await Promise.all([
          supabaseClient.from('aulas').update({ ordem: toIndex }).eq('id', idFrom).eq('turma_id', turmaId),
          supabaseClient.from('aulas').update({ ordem: fromIndex }).eq('id', idTo).eq('turma_id', turmaId),
        ]);
      }
    },
    [schedule, turmaId]
  );

  const addClass = useCallback(
    async (dayId: string, classItem: ClassItem) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimisticItem = { ...classItem, id: tempId };
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, classes: [...d.classes, optimisticItem] } : d
        )
      );
      if (!SUPABASE_ENABLED || !turmaId) return;
      const day = schedule.find((d) => d.id === dayId);
      const ordem = day ? day.classes.length : 0;
      const row = { ...mapClassItemToAulaRow(dayId, classItem, ordem), turma_id: turmaId };
      const { data, error } = await supabaseClient.from('aulas').insert(row).select('id').single();
      if (error) {
        setSchedule((prev) =>
          prev.map((d) =>
            d.id === dayId ? { ...d, classes: d.classes.filter((c) => c.id !== tempId) } : d
          )
        );
        showToast('Falha ao adicionar. Tente novamente.');
        return;
      }
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? {
                ...d,
                classes: d.classes.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)),
              }
            : d
        )
      );
    },
    [schedule, turmaId, showToast]
  );

  const removeClass = useCallback(
    async (dayId: string, index: number) => {
      const day = schedule.find((d) => d.id === dayId);
      const cls = day?.classes[index];
      const removed = cls ? { ...cls } : null;
      const remaining = day ? day.classes.filter((_, i) => i !== index) : [];
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, classes: remaining } : d
        )
      );
      if (!SUPABASE_ENABLED || !turmaId || !removed?.id || String(removed.id).startsWith('temp-')) return;
      const { error } = await supabaseClient.from('aulas').delete().eq('id', removed.id).eq('turma_id', turmaId);
      if (error) {
        setSchedule((prev) =>
          prev.map((d) => {
            if (d.id !== dayId) return d;
            const next = [...d.classes];
            next.splice(index, 0, removed);
            return { ...d, classes: next };
          })
        );
        showToast('Falha ao excluir. Tente novamente.');
        return;
      }
      // Renumerar ordem das restantes para evitar duplicatas
      await Promise.all(
        remaining.map((c, i) =>
          c.id && !String(c.id).startsWith('temp-')
            ? supabaseClient.from('aulas').update({ ordem: i }).eq('id', c.id).eq('turma_id', turmaId)
            : Promise.resolve()
        )
      );
    },
    [schedule, turmaId, showToast]
  );

  const updateClass = useCallback(
    async (dayId: string, index: number, classItem: Partial<ClassItem>) => {
      const day = schedule.find((d) => d.id === dayId);
      const current = day?.classes[index];
      if (!current) return;
      const previous = { ...current };
      setSchedule((prev) =>
        prev.map((d) => {
          if (d.id !== dayId) return d;
          const next = [...d.classes];
          if (next[index]) next[index] = { ...next[index]!, ...classItem };
          return { ...d, classes: next };
        })
      );
      if (!SUPABASE_ENABLED || !turmaId || !current.id || String(current.id).startsWith('temp-')) return;
      const row: Record<string, unknown> = {};
      if (classItem.subject != null) row.materia = classItem.subject;
      if (classItem.time != null) row.horario = classItem.time;
      if (classItem.location != null) row.sala = classItem.location;
      if (classItem.professor != null) row.professor = classItem.professor;
      if (classItem.type != null) row.tipo = classItem.type;
      if (classItem.grupoAlvo != null) row.grupo_alvo = classItem.grupoAlvo;
      if (Object.keys(row).length === 0) return;
      const { error } = await supabaseClient.from('aulas').update(row).eq('id', current.id).eq('turma_id', turmaId);
      if (error) {
        setSchedule((prev) =>
          prev.map((d) => {
            if (d.id !== dayId) return d;
            const next = [...d.classes];
            if (next[index]) next[index] = previous;
            return { ...d, classes: next };
          })
        );
        showToast('Falha ao salvar. Tente novamente.');
      }
    },
    [schedule, turmaId, showToast]
  );

  const addAula = useCallback(
    (aula: Omit<ClassItem, 'id'> & { dia_semana: string }) => {
      const { dia_semana, ...rest } = aula;
      const classItem: ClassItem = {
        ...rest,
        time: formatTimeRange(rest.horarioInicio ?? '08:00', rest.horarioFim ?? '10:00'),
      };
      addClass(dia_semana, classItem);
    },
    [addClass]
  );

  const removeAulaById = useCallback(
    (id: string) => {
      for (let d = 0; d < schedule.length; d++) {
        const idx = schedule[d].classes.findIndex((c) => c.id === id);
        if (idx >= 0) {
          removeClass(schedule[d].id, idx);
          return;
        }
      }
    },
    [schedule, removeClass]
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
      idiomaDias,
      groups,
      eventos,
      visibleDays,
      loadingInitial,
      savingMessage,
      toast,
      showToast,
      setTituloPrincipal,
      setSubtitulo,
      setGoogleDriveUrl,
      setPlatformUrl,
      setShowSaturday,
      setShowSunday,
      setIdiomaDias,
      addGroup,
      removeGroup,
      addEvento,
      updateEvento,
      removeEvento,
      updateDayClasses,
      addClass,
      removeClass,
      updateClass,
      addAula,
      updateAulaById,
      removeAulaById,
      moveClass,
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
      idiomaDias,
      groups,
      eventos,
      visibleDays,
      loadingInitial,
      savingMessage,
      toast,
      showToast,
      setTituloPrincipal,
      setSubtitulo,
      setGoogleDriveUrl,
      setPlatformUrl,
      setShowSaturday,
      setShowSunday,
      setIdiomaDias,
      addGroup,
      removeGroup,
      addEvento,
      updateEvento,
      removeEvento,
      updateDayClasses,
      addClass,
      removeClass,
      updateClass,
      addAula,
      updateAulaById,
      removeAulaById,
      moveClass,
      getInitialDayId,
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
