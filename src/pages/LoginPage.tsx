import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

export function LoginPage() {
  const { signIn, session, profile, profileLoading } = useAuth();

  if (session && profile && !profileLoading) {
    if (profile.role === 'ceo') return <Navigate to="/admin" replace />;
    if (profile.role === 'delegado') return <Navigate to="/delegado" replace />;
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        const msg =
          err.message?.toLowerCase().includes('invalid login') || err.message?.toLowerCase().includes('invalid_credentials')
            ? 'E-mail ou senha incorretos.'
            : err.message?.toLowerCase().includes('tempo esgotado') || err.message?.toLowerCase().includes('variáveis')
            ? err.message
            : err.message ?? 'Erro ao entrar. Tente novamente.';
        setError(msg);
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/80 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden p-8">
          {!isSupabaseConfigured && (
            <p className="mb-4 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-2xl px-3 py-2">
              Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do deploy (ex: Vercel) para o login funcionar.
            </p>
          )}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950 mb-4">
              <GraduationCap size={28} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 text-center">
              Gradly
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              Faça login para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className={inputClass}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className={inputClass}
                required
                disabled={submitting}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500/90 dark:text-red-400/90 text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.01 } : undefined}
              whileTap={!submitting ? { scale: 0.99 } : undefined}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 disabled:opacity-70 disabled:pointer-events-none transition-colors"
            >
              {submitting ? (
                <Loader2 size={20} strokeWidth={2} className="animate-spin" />
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
