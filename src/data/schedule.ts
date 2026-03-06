export type ClassType = 'teoria' | 'simulacion' | 'virtual' | 'practica';

/** "Todos" = aula para todos os grupos; caso contrário = nome do grupo (ex: "Grupo C.1") */
export const GRUPO_TODOS = 'Todos';

export interface ClassItem {
  subject: string;
  time: string;
  location: string;
  professor: string;
  type: ClassType;
  /** Grupo ao qual a aula se aplica: "Todos" ou o nome de um grupo */
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
