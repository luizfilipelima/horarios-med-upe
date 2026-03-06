import type { EventoItem } from '../context/AppContext';

/** Diferença em dias entre hoje (início do dia) e a data do evento. Positivo = futuro, 0 = hoje, negativo = passado. */
export function diasAteEvento(dataIso: string): number {
  const ev = new Date(dataIso);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  ev.setHours(0, 0, 0, 0);
  return Math.round((ev.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
}

/** Label para exibição: "Hoje!", "Amanhã", "Daqui a X dias" ou "Há X dias" */
export function labelDiasEvento(dataIso: string): string {
  const d = diasAteEvento(dataIso);
  if (d === 0) return 'Hoje!';
  if (d === 1) return 'Amanhã';
  if (d > 1 && d <= 31) return `Daqui a ${d} dias`;
  if (d > 31) return `Daqui a ${d} dias`;
  if (d === -1) return 'Ontem';
  return `Há ${Math.abs(d)} dias`;
}

/** Extrai número da pontuação (ex: "10", "10 pts", "2.5") para soma. Retorna 0 se não for número. */
export function parsePontuacao(p: string): number {
  if (!p || !p.trim()) return 0;
  const num = parseFloat(p.replace(/[^\d,.]/g, '').replace(',', '.'));
  return Number.isFinite(num) ? num : 0;
}

/** Soma as pontuações de uma lista de eventos. */
export function somaPontuacao(eventos: EventoItem[]): number {
  return eventos.reduce((acc, e) => acc + parsePontuacao(e.pontuacao), 0);
}
