import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseClient } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';

/** Remove o hash da URL para evitar que o Supabase reprocesse o token e dispare eventos em loop. */
function clearHash() {
  if (typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  const newUrl = pathname + search || pathname;
  window.history.replaceState(null, '', newUrl);
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

const MIN_PASSWORD_LENGTH = 8;

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirectScheduled = useRef(false);

  // Supabase processa os parâmetros da URL (hash) ao montar; a session pode chegar logo depois
  const [waitingSession, setWaitingSession] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setWaitingSession(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Limpa o hash assim que temos sessão, para evitar reprocessamento e loop do gotrue-js
  useEffect(() => {
    if (session?.user) clearHash();
  }, [session?.user]);

  const hasValidSession = Boolean(session?.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = password.trim();
    if (trimmed.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await supabaseClient.auth.updateUser({ password: trimmed });
      if (err) {
        const msg =
          err.message?.toLowerCase().includes('password')
            ? `Use uma senha mais forte (mínimo ${MIN_PASSWORD_LENGTH} caracteres).`
            : err.message || 'Não foi possível atualizar a senha. Tente novamente.';
        setError(msg);
        return;
      }
      clearHash();
      setSuccess(true);
      if (redirectScheduled.current) return;
      redirectScheduled.current = true;
      // Sign out evita lock/orphan do gotrue-js e erros 500 em refetch de perfil; usuário faz login de novo com a nova senha
      setTimeout(async () => {
        await signOut();
        navigate('/login', { replace: true });
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  // Sem Supabase configurado
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-8">
        <div className="max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-lg dark:border dark:border-zinc-800 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            Recuperação de senha indisponível. Configure o Supabase nas variáveis de ambiente do deploy.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  // Aguardando sessão (link de recuperação pode estar sendo processado)
  if (waitingSession && !hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" strokeWidth={2} />
          <span className="text-sm text-gray-500 dark:text-zinc-500">Verificando link…</span>
        </div>
      </div>
    );
  }

  // Sem sessão: link inválido ou expirado
  if (!hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-lg dark:border dark:border-zinc-800 text-center"
        >
          <div
            className="h-12 w-[158px] shrink-0 mx-auto mb-4"
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
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mb-6">
            Use a opção &quot;Esqueceu sua senha?&quot; na tela de login para receber um novo link.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
          >
            Ir para o login
          </button>
        </motion.div>
      </div>
    );
  }

  // Sucesso: senha atualizada
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-lg dark:border dark:border-zinc-800 text-center"
        >
          <div
            className="h-12 w-[158px] shrink-0 mx-auto mb-4"
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
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">Senha atualizada com sucesso!</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500">
            Redirecionando para o login…
          </p>
        </motion.div>
      </div>
    );
  }

  // Formulário: redefinir senha
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/80 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden p-8">
          <div className="flex flex-col items-center mb-8">
            <div
            className="h-12 w-[158px] shrink-0 mb-4"
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 text-center">
              Redefinir Senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              Escolha uma nova senha (mínimo 8 caracteres)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="update-password" className="sr-only">
                Nova senha
              </label>
              <input
                id="update-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className={inputClass}
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={submitting}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-500 text-center">
                Mínimo 8 caracteres
              </p>
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
                'Salvar Nova Senha'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
