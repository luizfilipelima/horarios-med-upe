import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '../lib/supabase';

export type UserRole = 'ceo' | 'delegado';

export interface UserProfile {
  id: string;
  role: UserRole;
  turma_id: string | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data } = await supabaseClient
      .from('perfis')
      .select('id, role, turma_id')
      .eq('id', userId)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      role: data.role as UserRole,
      turma_id: data.turma_id,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });

    const { data: authData } = supabaseClient.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setProfileLoading(true);
      if (s?.user?.id) {
        const p = await fetchProfile(s.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setProfileLoading(false);
    });

    return () => authData?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchProfile(session.user.id).then((p) => {
      setProfile(p);
      setProfileLoading(false);
    });
  }, [session?.user?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const TIMEOUT_MS = 15000;
      const result = await Promise.race([
        supabaseClient.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Tempo esgotado. Verifique sua conexão e as variáveis de ambiente do deploy.')), TIMEOUT_MS)
        ),
      ]);
      return { error: result.error ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Erro ao conectar. Tente novamente.') };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    session,
    profile,
    loading,
    profileLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
