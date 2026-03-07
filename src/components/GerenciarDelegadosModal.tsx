import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, UserPlus, Mail, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none';

interface Turma {
  id: string;
  nome: string;
  faculdade: string;
  slug_url: string;
}

interface Delegado {
  id: string;
  email: string;
}

interface GerenciarDelegadosModalProps {
  turma: Turma | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GerenciarDelegadosModal({ turma, isOpen, onClose, onSuccess }: GerenciarDelegadosModalProps) {
  const [delegados, setDelegados] = useState<Delegado[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDelegados = async () => {
    if (!turma?.id) return;
    setLoadingList(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabaseClient.functions.invoke('listar-delegados', {
        body: { turma_id: turma.id },
      });
      if (fnError) throw fnError;
      const list = (data?.delegados ?? []) as Delegado[];
      setDelegados(list);
    } catch (e) {
      setError('Não foi possível carregar os delegados. Certifique-se de que a Edge Function listar-delegados está implantada.');
      setDelegados([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && turma) fetchDelegados();
  }, [isOpen, turma?.id]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turma?.id || !email.trim() || !password) return;
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { data, error: fnError } = await supabaseClient.functions.invoke('criar-delegado', {
        body: { email: email.trim().toLowerCase(), password, turma_id: turma.id },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setEmail('');
      setPassword('');
      fetchDelegados();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar delegado. Verifique se a Edge Function criar-delegado está implantada.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarReset = async (delegadoEmail: string) => {
    setSendingReset(delegadoEmail);
    setError(null);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : '';
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(delegadoEmail, {
        redirectTo: redirectUrl,
      });
      if (resetError) throw resetError;
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar link de redefinir senha.');
    } finally {
      setSendingReset(null);
    }
  };

  const handleExcluir = async (userId: string) => {
    if (!confirm('Excluir este delegado da turma? Ele não terá mais acesso.')) return;
    setDeleting(userId);
    setError(null);
    try {
      const { error: delError } = await supabaseClient.from('perfis').delete().eq('id', userId);
      if (delError) throw delError;
      setDelegados((prev) => prev.filter((d) => d.id !== userId));
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir delegado.');
    } finally {
      setDeleting(null);
    }
  };

  if (!turma) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Gerenciar Delegados
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
                <div className="rounded-2xl bg-gray-50 dark:bg-zinc-800/60 p-4 border border-gray-100 dark:border-zinc-700">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100">{turma.nome}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">
                    {turma.faculdade} · <span className="font-mono">{turma.slug_url}</span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                    <AlertTriangle size={18} strokeWidth={2} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleCriar} className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                    Adicionar novo delegado
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail do delegado"
                    className={inputClass}
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha padrão (mín. 6 caracteres)"
                    className={inputClass}
                    required
                    minLength={6}
                  />
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={!saving ? { scale: 1.01 } : undefined}
                    whileTap={!saving ? { scale: 0.99 } : undefined}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={18} strokeWidth={2} />
                        Criar delegado
                      </>
                    )}
                  </motion.button>
                </form>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Delegados desta turma
                  </p>
                  {loadingList ? (
                    <div className="flex justify-center py-6">
                      <Loader2 size={24} className="animate-spin text-indigo-500" strokeWidth={2} />
                    </div>
                  ) : delegados.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-zinc-500 py-4 text-center">
                      Nenhum delegado cadastrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {delegados.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-zinc-800/60 px-4 py-3 border border-gray-100 dark:border-zinc-700"
                        >
                          <span className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate flex-1 min-w-0">
                            {d.email}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <motion.button
                              type="button"
                              onClick={() => handleEnviarReset(d.email)}
                              disabled={!!sendingReset}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50"
                              title="Enviar link para redefinir senha"
                            >
                              {sendingReset === d.email ? (
                                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                              ) : (
                                <Mail size={18} strokeWidth={2} />
                              )}
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => handleExcluir(d.id)}
                              disabled={!!deleting}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                              title="Excluir delegado"
                            >
                              {deleting === d.id ? (
                                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} strokeWidth={2} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
