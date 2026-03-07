import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, UserPlus, Mail, Trash2, Loader2, AlertTriangle } from 'lucide-react';

function toWhatsAppUrl(whatsapp: string | null | undefined): string | null {
  if (!whatsapp?.trim()) return null;
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const full = digits.startsWith('55') || digits.startsWith('595') ? digits : '55' + digits;
  return `https://wa.me/${full}`;
}
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
  whatsapp?: string | null;
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
                            {toWhatsAppUrl(d.whatsapp) && (
                              <motion.a
                                href={toWhatsAppUrl(d.whatsapp)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                title="Abrir conversa no WhatsApp"
                                aria-label="WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </motion.a>
                            )}
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
