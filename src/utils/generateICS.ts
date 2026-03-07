import type { ClassItem, DaySchedule } from '../data/schedule';
import { GRUPO_TODOS } from '../data/schedule';
import type { EventoItem } from '../context/AppContext';

const FILTER_TODOS = 'TODOS';

const DAY_ID_TO_WEEKDAY: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 0,
};

function filterClassesByGroup(day: DaySchedule, selectedGroupFilter: string): ClassItem[] {
  if (selectedGroupFilter === FILTER_TODOS) return day.classes;
  return day.classes.filter((c) => {
    const grupo = c.grupoAlvo?.trim() || GRUPO_TODOS;
    return grupo === GRUPO_TODOS || grupo === selectedGroupFilter;
  });
}

/** Parse "09:00 - 13:00" -> { start: "09:00", end: "13:00" } */
function parseTimeRange(time: string): { start: string; end: string } | null {
  const parts = time.split(/\s*-\s*/).map((p) => p.trim());
  if (parts.length !== 2) return null;
  const [start, end] = parts;
  if (!start || !end) return null;
  return { start, end };
}

/** Get the date of a given weekday (0=Sun, 1=Mon, ...) in the current week. */
function getDateForWeekday(weekday: number): Date {
  const now = new Date();
  const today = now.getDay();
  const diff = weekday - today;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  return date;
}

/** Format YYYYMMDD */
function formatDateICal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Format HHMMSS from "09:00" or "13:30" */
function timeToICal(time: string): string {
  const digits = time.replace(/\D/g, '');
  return digits.padEnd(6, '0').slice(0, 6);
}

/** Escape iCal text (commas, semicolons, backslashes). */
function escapeICalText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Fold long lines (max 75 octets, continuation with CRLF + space). */
function foldLine(line: string): string {
  const crlf = '\r\n';
  if (line.length <= 75) return line;
  let out = '';
  let pos = 0;
  while (pos < line.length) {
    const chunk = line.slice(pos, pos + 75);
    out += (out ? crlf + ' ' : '') + chunk;
    pos += 75;
  }
  return out;
}

function buildEvent(
  classItem: ClassItem,
  dayId: string,
  groupLabel: string,
  dtstamp: string
): string {
  const range = parseTimeRange(classItem.time);
  if (!range) return '';

  const weekday = DAY_ID_TO_WEEKDAY[dayId];
  if (weekday === undefined) return '';

  const baseDate = getDateForWeekday(weekday);
  const dateStr = formatDateICal(baseDate);
  const startTime = timeToICal(range.start);
  const endTime = timeToICal(range.end);

  const dtStart = `${dateStr}T${startTime}`;
  const dtEnd = `${dateStr}T${endTime}`;
  const uid = `${dateStr}-${range.start}-${escapeICalText(classItem.subject).slice(0, 30)}-${dayId}@horarios-medicina`;

  const summary = escapeICalText(classItem.subject);
  const location = escapeICalText(classItem.location);
  const description = escapeICalText(
    `Professor: ${classItem.professor}\nGrupo: ${groupLabel}`
  );
  const alarmDesc = escapeICalText(
    `Sua aula de ${classItem.subject} começa em 10 min na ${classItem.location}`
  );

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'RRULE:FREQ=WEEKLY',
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-PT10M',
    `DESCRIPTION:${alarmDesc}`,
    'END:VALARM',
    'END:VEVENT',
  ];

  return lines.map(foldLine).join('\r\n');
}

/** Formata data ISO para iCal datetime (YYYYMMDDTHHMMSS). */
function formatDateTimeICal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}`;
}

/** Gera VEVENT para um evento de avaliação (Prova/Trabalho). Alarme 1 dia antes. */
function buildEventFromEvento(ev: EventoItem, dtstamp: string): string {
  const start = new Date(ev.data);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
  const dtStart = formatDateTimeICal(ev.data);
  const dtEnd = formatDateTimeICal(end.toISOString());
  const uid = `ev-${ev.id}@horarios-medicina`;
  const summary = escapeICalText(`[${ev.tipo}] ${ev.titulo}`);
  const description = escapeICalText(
    [ev.materia && `Matéria: ${ev.materia}`, ev.pontuacao && `Pontuação: ${ev.pontuacao}`, ev.descricao].filter(Boolean).join('\n')
  );
  const alarmDesc = escapeICalText(`${ev.tipo}: ${ev.titulo} — amanhã`);

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-P1D',
    `DESCRIPTION:${alarmDesc}`,
    'END:VALARM',
    'END:VEVENT',
  ];

  return lines.map(foldLine).join('\r\n');
}

/**
 * Conta quantas aulas seriam exportadas para o grupo selecionado.
 */
export function countExportableClasses(
  visibleDays: DaySchedule[],
  selectedGroupFilter: string
): number {
  let n = 0;
  for (const day of visibleDays) {
    const classes = filterClassesByGroup(day, selectedGroupFilter);
    for (const classItem of classes) {
      if (parseTimeRange(classItem.time) && DAY_ID_TO_WEEKDAY[day.id] !== undefined) n++;
    }
  }
  return n;
}

/**
 * Gera o conteúdo do arquivo .ics com as aulas filtradas pelo grupo selecionado
 * e os eventos de avaliação (Prova/Trabalho) com alarme 1 dia antes.
 */
export function generateICS(
  visibleDays: DaySchedule[],
  selectedGroupFilter: string,
  eventos: EventoItem[] = []
): string {
  const now = new Date();
  const dtstamp =
    now.getUTCFullYear() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    'T' +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0') +
    'Z';

  const groupLabel = selectedGroupFilter === FILTER_TODOS ? 'Todos' : selectedGroupFilter;
  const events: string[] = [];

  for (const day of visibleDays) {
    const classes = filterClassesByGroup(day, selectedGroupFilter);
    for (const classItem of classes) {
      const event = buildEvent(classItem, day.id, groupLabel, dtstamp);
      if (event) events.push(event);
    }
  }

  for (const ev of eventos) {
    events.push(buildEventFromEvento(ev, dtstamp));
  }

  const body = events.join('\r\n');
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Horarios Medicina//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    body,
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n');

  return calendar;
}

/** Dispara o download do arquivo .ics no navegador. */
export function downloadICS(contents: string, filename = 'meu-horario-medicina.ics'): void {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
