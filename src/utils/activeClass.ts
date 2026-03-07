import type { ClassItem } from '../data/schedule';

const DAY_ID_MAP: Record<number, string> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
};

/** Retorna o id do dia da semana de hoje (ex: 'miercoles') */
export function getTodayDayId(): string {
  const today = new Date().getDay();
  return DAY_ID_MAP[today] ?? 'lunes';
}

/** Converte "HH:mm" em minutos desde meia-noite */
function parseToMinutes(str: string): number {
  if (!str || typeof str !== 'string') return 0;
  const [h, m] = str.trim().split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Verifica se a aula está acontecendo agora.
 * @param horarioInicio - Início da aula (HH:mm)
 * @param horarioFim - Fim da aula (HH:mm)
 * @param dayId - Id do dia da aula (ex: 'lunes', 'miercoles')
 * @param now - Data/hora atual (para testes; usa new Date() se omitido)
 */
export function isClassActive(
  horarioInicio: string | undefined,
  horarioFim: string | undefined,
  dayId: string,
  now: Date = new Date()
): boolean {
  const todayId = DAY_ID_MAP[now.getDay()] ?? 'lunes';
  if (todayId !== dayId) return false;

  const { inicio, fim } = getClassHorariosFromParts(horarioInicio, horarioFim);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseToMinutes(inicio);
  const endMinutes = parseToMinutes(fim);

  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
}

function getClassHorariosFromParts(
  horarioInicio?: string,
  horarioFim?: string
): { inicio: string; fim: string } {
  if (horarioInicio && horarioFim) return { inicio: horarioInicio, fim: horarioFim };
  return { inicio: horarioInicio || '08:00', fim: horarioFim || '10:00' };
}

/**
 * Extrai horário de início e fim de um ClassItem.
 */
export function getClassHorarios(item: ClassItem): { inicio: string; fim: string } {
  if (item.horarioInicio && item.horarioFim) {
    return { inicio: item.horarioInicio, fim: item.horarioFim };
  }
  const parts = (item.time || '').split(/\s*-\s*/).map((p) => p.trim());
  return {
    inicio: parts[0] || '08:00',
    fim: parts[1] || '10:00',
  };
}
