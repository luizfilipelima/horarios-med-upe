import type { EventoItem } from '../context/AppContext';

function escapeICalText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

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

/**
 * Gera um arquivo .ics com um único evento de avaliação e alarme 24h antes.
 */
export function generateEventReminderICS(ev: EventoItem): string {
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

  const start = new Date(ev.data);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const dtStart = formatDateTimeICal(ev.data);
  const dtEnd = formatDateTimeICal(end.toISOString());
  const uid = `ev-reminder-${ev.id}@gradly`;
  const summary = escapeICalText(`[${ev.tipo}] ${ev.titulo}`);
  const description = escapeICalText(
    [ev.materia && `Matéria: ${ev.materia}`, ev.pontuacao && `Pontuação: ${ev.pontuacao}`, ev.descricao].filter(Boolean).join('\n')
  );
  const alarmDesc = escapeICalText(`Lembrete: ${ev.tipo} ${ev.titulo} amanhã`);

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
    'TRIGGER:-PT24H',
    `DESCRIPTION:${alarmDesc}`,
    'END:VALARM',
    'END:VEVENT',
  ];

  const body = lines.map(foldLine).join('\r\n');
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gradly//Lembrete Avaliação//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    body,
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n');

  return calendar;
}
