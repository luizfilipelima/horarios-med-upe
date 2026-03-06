import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabaseClient } from '../lib/supabase';

export interface TurmaInfo {
  id: string;
  nome: string;
  faculdade: string;
  slug_url: string;
}

interface TurmaContextValue {
  turmaId: string | null;
  slug: string | null;
  turma: TurmaInfo | null;
  loading: boolean;
}

const TurmaContext = createContext<TurmaContextValue | null>(null);

interface TurmaProviderProps {
  turmaId: string | null;
  slug: string | null;
  children: ReactNode;
}

/** Prove turmaId e slug para o AppContext carregar dados da turma correta */
export function TurmaProvider({ turmaId, slug, children }: TurmaProviderProps) {
  const [turma, setTurma] = useState<TurmaInfo | null>(null);
  const [loading, setLoading] = useState(Boolean(turmaId || slug));

  useEffect(() => {
    if (!turmaId && !slug) {
      setTurma(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    async function load() {
      const query = turmaId
        ? supabaseClient.from('turmas').select('id, nome, faculdade, slug_url').eq('id', turmaId).single()
        : supabaseClient.from('turmas').select('id, nome, faculdade, slug_url').eq('slug_url', slug).single();

      const { data } = await query;
      if (!cancelled && data) {
        setTurma(data as TurmaInfo);
      } else if (!cancelled) {
        setTurma(null);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [turmaId, slug]);

  const value: TurmaContextValue = {
    turmaId: turmaId ?? turma?.id ?? null,
    slug: slug ?? turma?.slug_url ?? null,
    turma,
    loading,
  };

  return <TurmaContext.Provider value={value}>{children}</TurmaContext.Provider>;
}

export function useTurma() {
  const ctx = useContext(TurmaContext);
  if (!ctx) throw new Error('useTurma must be used within TurmaProvider');
  return ctx;
}

export function useTurmaOptional() {
  return useContext(TurmaContext);
}
