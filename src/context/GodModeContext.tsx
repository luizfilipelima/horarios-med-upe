import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface GodModeContextValue {
  godModeTurmaId: string | null;
  enterGodMode: (turmaId: string) => void;
  exitGodMode: () => void;
}

const GodModeContext = createContext<GodModeContextValue | null>(null);

const STORAGE_KEY = 'gradly-god-mode-turma';

export function GodModeProvider({ children }: { children: ReactNode }) {
  const [godModeTurmaId, setGodModeTurmaId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const enterGodMode = useCallback((turmaId: string) => {
    setGodModeTurmaId(turmaId);
    try {
      localStorage.setItem(STORAGE_KEY, turmaId);
    } catch {}
  }, []);

  const exitGodMode = useCallback(() => {
    setGodModeTurmaId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value: GodModeContextValue = { godModeTurmaId, enterGodMode, exitGodMode };

  return (
    <GodModeContext.Provider value={value}>{children}</GodModeContext.Provider>
  );
}

export function useGodMode() {
  const ctx = useContext(GodModeContext);
  if (!ctx) throw new Error('useGodMode must be used within GodModeProvider');
  return ctx;
}
