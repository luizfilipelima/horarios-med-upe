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
  profileError: string | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
  const { data, error } = await supabaseClient
    .from('perfis')
    .select('id, role, turma_id')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { profile: null, error: error.message };
  if (!data) return { profile: null, error: null };
  return {
    profile: { id: data.id, role: data.role as UserRole, turma_id: data.turma_id },
    error: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
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

    const { data: authData } = supabaseClient.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s?.user?.id) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
      }
      // Profile é carregado pelo useEffect quando session.user.id muda (evita fetch duplicado)
    });

    return () => {
      if (authData?.subscription) authData.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    fetchProfile(session.user.id).then(({ profile: p, error: e }) => {
      setProfile(p);
      setProfileError(e);
      setProfileLoading(false);
    });
  }, [session?.user?.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error: error as unknown as Error };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
    setProfile(null);
  }, []);

  const refetchProfile = useCallback(async () => {
    const uid = supabaseClient.auth.getUser().then(({ data: { user } }) => user?.id);
    const id = await uid;
    if (!id) return;
    setProfileLoading(true);
    const { profile: p, error: e } = await fetchProfile(id);
    setProfile(p);
    setProfileError(e);
    setProfileLoading(false);
  }, []);

  const value: AuthContextValue = {
    session,
    profile,
    profileError,
    loading,
    profileLoading,
    signIn,
    signOut,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
