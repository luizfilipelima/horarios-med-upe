import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabaseClient } from '../lib/supabase';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

function isAbortOrLockError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /lock broken|abort/i.test(msg);
}

export function LoginPage() {
  const { signIn, signOut, session, profile, profileError, profileLoading } = useAuth();

  if (session && !profileLoading) {
    if (profile?.role === 'ceo') return <Navigate to="/admin" replace />;
    if (profile?.role === 'delegado') return <Navigate to="/delegado" replace />;
    if (profile === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-8">
          <div className="max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-lg dark:border dark:border-zinc-800 text-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">Login realizado</h2>
            {profileError && !isAbortOrLockError(new Error(profileError)) ? (
              <p className="text-sm text-red-500 dark:text-red-400 mb-4">{profileError}</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">
                  Sua conta ainda não está vinculada. Contate o administrador para ser adicionado como CEO ou delegado.
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mb-4 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 px-3 py-2 text-left">
                  Se você é o administrador: no Supabase (SQL Editor) confira se existe uma linha em <code className="text-indigo-500 dark:text-indigo-400">perfis</code> com <code className="text-indigo-500 dark:text-indigo-400">id</code> igual ao User UID em Authentication → Users e <code className="text-indigo-500 dark:text-indigo-400">role = &apos;ceo&apos;</code>.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              Sair
            </button>
          </div>
        </div>
      );
    }
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (_e: React.FormEvent) => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        if (isAbortOrLockError(err)) return; // requisição real provavelmente passou
        setError(err.message ?? String(err));
        setIsLoading(false);
        return;
      }
      // Sucesso: não altera isLoading; a tela permanece carregando até o redirect assumir
    } catch (err) {
      if (isAbortOrLockError(err)) return;
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotMessage(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/update-password`;
      await supabaseClient.auth.resetPasswordForEmail(trimmed, { redirectTo });
      setForgotMessage('Se o e-mail existir, você receberá um link de recuperação. Verifique também a pasta de spam.');
    } catch {
      setForgotMessage('Se o e-mail existir, você receberá um link de recuperação. Verifique também a pasta de spam.');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleForgotSubmit(e);
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
            <div
              className="h-12 w-[158px] shrink-0 mb-3"
              style={{
                WebkitMaskImage: "url('/gradly.svg')",
                maskImage: "url('/gradly.svg')",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                backgroundColor: "#6366F1",
              }}
              role="img"
              aria-label="Gradly"
            />
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              {forgotMode ? 'Recuperação de senha' : 'Faça login para continuar'}
            </p>
            {forgotMode && (
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                Informe seu e-mail para receber o link
              </p>
            )}
          </div>

          {forgotMode ? (
            <form onSubmit={onForgotSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="sr-only">
                  E-mail
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className={inputClass}
                  required
                  disabled={isLoading}
                />
              </div>
              {forgotMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 dark:text-zinc-400 text-center rounded-2xl bg-gray-100 dark:bg-zinc-800 px-3 py-2"
                >
                  {forgotMessage}
                </motion.p>
              )}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.01 } : undefined}
                whileTap={!isLoading ? { scale: 0.99 } : undefined}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 disabled:opacity-70 disabled:pointer-events-none transition-colors"
              >
                {isLoading ? (
                  <Loader2 size={20} strokeWidth={2} className="animate-spin" />
                ) : (
                  'Enviar link de recuperação'
                )}
              </motion.button>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotMessage(null); setError(null); }}
                className="w-full text-sm text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 py-2"
              >
                Voltar ao login
              </button>
            </form>
          ) : (
            <form onSubmit={onLoginSubmit} className="space-y-4" noValidate>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-gray-500 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  Esqueceu sua senha?
                </button>
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
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.01 } : undefined}
                whileTap={!isLoading ? { scale: 0.99 } : undefined}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 disabled:opacity-70 disabled:pointer-events-none transition-colors"
              >
                {isLoading ? (
                  <Loader2 size={20} strokeWidth={2} className="animate-spin" />
                ) : (
                  'Entrar'
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
