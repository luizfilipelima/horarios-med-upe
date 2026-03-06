export type ClassType = 'teoria' | 'simulacion' | 'virtual';

export interface ClassItem {
  subject: string;
  time: string;
  location: string;
  professor: string;
  type: ClassType;
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
      },
      {
        subject: 'Medicina en Imágenes',
        time: '13:30 - 16:30',
        location: 'Sala 34, 1º Piso, Bloque E',
        professor: 'Dra. Maria Teresa Insfran',
        type: 'teoria',
      },
      {
        subject: 'Oftalmología',
        time: '18:00 - 21:30',
        location: 'Virtual',
        professor: 'Dr. Emilio Carvalho',
        type: 'virtual',
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
      },
      {
        subject: 'Semiología Quirúrgica',
        time: '13:30 - 16:30',
        location: 'Sala 27, 5º Piso, Bloque B',
        professor: 'Dr. Walter Delgado',
        type: 'teoria',
      },
      {
        subject: 'Terapeutica y Toxicología',
        time: '16:30 - 19:30',
        location: 'Sala 36, 2º Piso, Bloque E',
        professor: 'Dra. Diana Bogarin',
        type: 'teoria',
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
      },
      {
        subject: 'Patología Quirúrgica',
        time: '13:00 - 16:00',
        location: 'Sala 39, 2º Piso, Bloque E',
        professor: 'Dr. Elias Pinto',
        type: 'teoria',
      },
      {
        subject: 'Ginecología y Obstetrícia',
        time: '16:30 - 18:30',
        location: 'C1 S - Sala Simulación G.O I',
        professor: 'Dra. Feltes',
        type: 'simulacion',
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
      },
      {
        subject: 'Semiología Medica',
        time: '10:30 - 14:30',
        location: 'Sala 33, 1º Piso, Bloque E',
        professor: 'Dr. Héctor Arnella',
        type: 'teoria',
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
      },
      {
        subject: 'Semiología Medica',
        time: '16:30 - 18:30',
        location: 'C1 - Sala Semio. Médica',
        professor: 'Dr. Héctor Arnella',
        type: 'simulacion',
      },
    ],
  },
];

export const getInitialDayId = (): string => {
  const today = new Date().getDay();
  // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  const map: Record<number, string> = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
  };
  return map[today] ?? 'lunes';
};
