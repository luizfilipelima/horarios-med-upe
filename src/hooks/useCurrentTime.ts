import { useEffect, useState } from 'react';

const INTERVAL_MS = 60_000; // 1 minuto

/**
 * Hook que retorna a data/hora atual e reavalia a cada minuto,
 * para manter "Aula Atual" sempre atualizado.
 */
export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return now;
}
