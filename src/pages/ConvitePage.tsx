import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseClient } from '../lib/supabase';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow';

interface ConviteWithTurma {
  id: string;
  token: string;
  turma_id: string;
  usado: boolean;
  turmas: { nome: string } | null;
}

export function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [convite, setConvite] = useState<ConviteWithTurma | null>(null);
  const [invalid, setInvalid] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabaseClient
        .from('convites')
        .select('id, token, turma_id, usado, turmas(nome)')
        .eq('token', token)
        .single();
      if (cancelled) return;
      if (err || !data) {
        setInvalid(true);
        setConvite(null);
      } else {
        const row = data as unknown as ConviteWithTurma;
        if (row.usado) {
          setInvalid(true);
          setConvite(null);
        } else {
          setConvite(row);
          setInvalid(false);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convite) return;
    setError(null);
    setSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setSubmitting(false);
      const msg = signUpError.message;
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('least'))
        setError('Use uma senha com no mínimo 6 caracteres.');
      else if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered'))
        setError('Este e-mail já está cadastrado.');
      else
        setError(msg ?? 'Erro ao criar conta. Tente novamente.');
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setSubmitting(false);
      setError('Erro ao criar conta. Tente novamente.');
      return;
    }

    const { data: rpcData, error: rpcError } = await supabaseClient.rpc('aceitar_convite', {
      p_token: token,
      p_user_id: userId,
    });

    if (rpcError) {
      setSubmitting(false);
      setError('Conta criada, mas falha ao vincular à turma. Entre em contato com o suporte.');
      return;
    }

    const result = rpcData as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      setSubmitting(false);
      setError(result?.error ?? 'Falha ao vincular à turma.');
      return;
    }

    await refetchProfile();
    setSubmitting(false);
    navigate('/delegado', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
          <span className="text-sm text-gray-500 dark:text-zinc-500">Verificando convite...</span>
        </motion.div>
      </div>
    );
  }

  if (invalid || !convite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/80 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-red-500 dark:text-red-400" strokeWidth={2} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">
              Convite inválido ou já utilizado
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500">
              Solicite um novo link de convite ao administrador.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const turmaNome = convite.turmas?.nome ?? 'esta turma';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/80 dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950 mb-4">
              <GraduationCap size={28} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 text-center">
              Bem-vindo!
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500 text-center mt-1">
              Você foi convidado para gerenciar a turma <strong className="text-gray-700 dark:text-zinc-300">{turmaNome}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="convite-email" className="sr-only">
                E-mail
              </label>
              <input
                id="convite-email"
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
              <label htmlFor="convite-password" className="sr-only">
                Senha
              </label>
              <input
                id="convite-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mín. 6 caracteres)"
                className={inputClass}
                required
                minLength={6}
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
                'Criar Minha Conta'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
