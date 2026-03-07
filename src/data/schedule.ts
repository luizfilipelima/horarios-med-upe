export type ClassType = 'teoria' | 'simulacion' | 'virtual' | 'practica';

/** "Todos" = aula para todos os grupos; caso contrário = nome do grupo ou lista (ex: "C.1,C.2") */
export const GRUPO_TODOS = 'Todos';

const GRUPO_SEP = ',';

/** Converte string armazenada em grupoAlvo para array de grupos */
export function parseGruposAlvo(s: string | undefined): string[] {
  const v = (s || '').trim();
  if (!v || v === GRUPO_TODOS) return [GRUPO_TODOS];
  return v.split(GRUPO_SEP).map((g) => g.trim()).filter(Boolean);
}

/** Converte array de grupos para string armazenada em grupo_alvo */
export function serializeGruposAlvo(arr: string[]): string {
  const list = arr.filter((g) => g && g !== GRUPO_TODOS);
  if (list.length === 0 || arr.includes(GRUPO_TODOS)) return GRUPO_TODOS;
  return list.join(GRUPO_SEP);
}

/** Verifica se a aula deve aparecer para o grupo selecionado */
export function isClassForGroup(grupoAlvo: string | undefined, selectedGroup: string): boolean {
  const grupos = parseGruposAlvo(grupoAlvo);
  if (grupos.includes(GRUPO_TODOS)) return true;
  return grupos.includes(selectedGroup);
}

/** Remove um grupo do valor grupoAlvo (para removerGrupo no AppContext) */
export function removeGroupFromGrupoAlvo(grupoAlvo: string, groupToRemove: string): string {
  const grupos = parseGruposAlvo(grupoAlvo).filter((g) => g !== groupToRemove && g !== GRUPO_TODOS);
  return grupos.length === 0 ? GRUPO_TODOS : grupos.join(GRUPO_SEP);
}

export interface ClassItem {
  /** UUID no Supabase; presente quando a aula veio do banco */
  id?: string;
  subject: string;
  /** Formato "08:00 - 10:00" (derivado de horarioInicio/horarioFim ou legado) */
  time: string;
  /** Horário de início HH:mm (ex: 08:00) */
  horarioInicio?: string;
  /** Horário de fim HH:mm (ex: 10:00) */
  horarioFim?: string;
  location: string;
  professor: string;
  type: ClassType;
  /** Grupo(s) aos quais a aula se aplica: "Todos" ou "C.1,C.2" (vários grupos) */
  grupoAlvo: string;
}

export interface DaySchedule {
  id: string;
  label: string;
  shortLabel: string;
  classes: ClassItem[];
}

export const schedule: DaySchedule[] = [
  {
    id: 'lunes',
    label: 'Lunes',
    shortLabel: 'Lun',
    classes: [
      {
        subject: 'Ginecología y Obstetrícia',
        time: '09:00 - 13:00',
        location: 'Sala 27, 5º Piso, Bloque B',
        professor: 'Dra. Feltes',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Medicina en Imágenes',
        time: '13:30 - 16:30',
        location: 'Sala 34, 1º Piso, Bloque E',
        professor: 'Dra. Maria Teresa Insfran',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Oftalmología',
        time: '18:00 - 21:30',
        location: 'Virtual',
        professor: 'Dr. Emilio Carvalho',
        type: 'virtual',
        grupoAlvo: 'Todos',
      },
    ],
  },
  {
    id: 'martes',
    label: 'Martes',
    shortLabel: 'Mar',
    classes: [
      {
        subject: 'Patología Medica',
        time: '07:30 - 10:30',
        location: 'Sala 34, 1º Piso, Bloque E',
        professor: 'Dr. Jesus Tellez',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Semiología Quirúrgica',
        time: '13:30 - 16:30',
        location: 'Sala 27, 5º Piso, Bloque B',
        professor: 'Dr. Walter Delgado',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Terapeutica y Toxicología',
        time: '16:30 - 19:30',
        location: 'Sala 36, 2º Piso, Bloque E',
        professor: 'Dra. Diana Bogarin',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
    ],
  },
  {
    id: 'miercoles',
    label: 'Miércoles',
    shortLabel: 'Mié',
    classes: [
      {
        subject: 'Traumatología y Ortopedía',
        time: '07:00 - 10:30',
        location: 'Sala 34, 1º Piso, Bloque E',
        professor: 'Dra. Patricia Gonzalez',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Patología Quirúrgica',
        time: '13:00 - 16:00',
        location: 'Sala 39, 2º Piso, Bloque E',
        professor: 'Dr. Elias Pinto',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Ginecología y Obstetrícia',
        time: '16:30 - 18:30',
        location: 'C1 S - Sala Simulación G.O I',
        professor: 'Dra. Feltes',
        type: 'simulacion',
        grupoAlvo: 'Todos',
      },
    ],
  },
  {
    id: 'jueves',
    label: 'Jueves',
    shortLabel: 'Jue',
    classes: [
      {
        subject: 'Semiología Quirúrgica',
        time: '07:30 - 09:30',
        location: 'C1 - Sala Clínica Pediátrica I',
        professor: 'Dr. Walter Delgado',
        type: 'simulacion',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Semiología Medica',
        time: '10:30 - 14:30',
        location: 'Sala 33, 1º Piso, Bloque E',
        professor: 'Dr. Héctor Arnella',
        type: 'teoria',
        grupoAlvo: 'Todos',
      },
    ],
  },
  {
    id: 'viernes',
    label: 'Viernes',
    shortLabel: 'Vie',
    classes: [
      {
        subject: 'Dermatología',
        time: '13:00 - 16:30',
        location: 'Virtual',
        professor: 'Dra. Ingrid Centurión',
        type: 'virtual',
        grupoAlvo: 'Todos',
      },
      {
        subject: 'Semiología Medica',
        time: '16:30 - 18:30',
        location: 'C1 - Sala Semio. Médica',
        professor: 'Dr. Héctor Arnella',
        type: 'simulacion',
        grupoAlvo: 'Todos',
      },
    ],
  },
];

const sabado: DaySchedule = {
  id: 'sabado',
  label: 'Sábado',
  shortLabel: 'Sáb',
  classes: [],
};

const domingo: DaySchedule = {
  id: 'domingo',
  label: 'Domingo',
  shortLabel: 'Dom',
  classes: [],
};

export const initialScheduleWithWeekend: DaySchedule[] = [
  ...schedule,
  sabado,
  domingo,
];

/** Dia da semana (id usado no banco e na UI) */
export const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
export type DiaSemanaId = (typeof DIAS_SEMANA)[number];

/** Constrói string de tempo "HH:mm - HH:mm" a partir de início e fim */
export function formatTimeRange(horarioInicio: string, horarioFim: string): string {
  if (!horarioInicio || !horarioFim) return '';
  return `${horarioInicio} - ${horarioFim}`;
}

/** Ordem dos 7 dias para montar o cronograma a partir do banco */
export const DAYS_ORDER: { id: string; label: string; shortLabel: string }[] = [
  { id: 'lunes', label: 'Lunes', shortLabel: 'Lun' },
  { id: 'martes', label: 'Martes', shortLabel: 'Mar' },
  { id: 'miercoles', label: 'Miércoles', shortLabel: 'Mié' },
  { id: 'jueves', label: 'Jueves', shortLabel: 'Jue' },
  { id: 'viernes', label: 'Viernes', shortLabel: 'Vie' },
  { id: 'sabado', label: 'Sábado', shortLabel: 'Sáb' },
  { id: 'domingo', label: 'Domingo', shortLabel: 'Dom' },
];

export function getInitialDayId(): string {
  const today = new Date().getDay();
  const map: Record<number, string> = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
    0: 'domingo',
  };
  return map[today] ?? 'lunes';
}

/** Cria estrutura de 7 dias com arrays de aulas vazios (para hidratar a partir do Supabase) */
export function createEmptySchedule(): DaySchedule[] {
  return DAYS_ORDER.map((d) => ({ ...d, classes: [] }));
}
