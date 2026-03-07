import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Check, Phone, Mail, BookOpen } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';
import { sendApprovalEmail } from '../utils/emailService';

interface SolicitacaoPendente {
  id: string;
  email: string;
  nome_completo: string | null;
  nome_turma: string | null;
  slug_desejado: string | null;
  whatsapp: string | null;
}

interface SolicitacoesPendentesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SolicitacoesPendentesModal({ isOpen, onClose, onSuccess }: SolicitacoesPendentesModalProps) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabaseClient.functions.invoke(
        'listar-solicitacoes-pendentes'
      );
      if (fnError) throw fnError;
      setSolicitacoes((data?.solicitacoes ?? []) as SolicitacaoPendente[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar solicitações.');
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSolicitacoes();
  }, [isOpen]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleAprovar = async (s: SolicitacaoPendente) => {
    if (!s.nome_turma?.trim() || !s.slug_desejado?.trim()) return;
    setProcessingId(s.id);
    setError(null);
    try {
      const { data, error: fnError } = await supabaseClient.functions.invoke('aprovar-solicitacao', {
        body: {
          perfil_id: s.id,
          nome_turma: s.nome_turma.trim(),
          slug_desejado: s.slug_desejado.trim(),
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setSolicitacoes((prev) => prev.filter((x) => x.id !== s.id));
      onSuccess();

      const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
      try {
        await sendApprovalEmail(
          s.email,
          s.nome_completo || 'Delegado(a)',
          s.nome_turma || 'sua turma',
          loginUrl
        );
      } catch (emailErr) {
        console.error('Erro ao enviar e-mail, mas turma aprovada', emailErr);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao aprovar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeitar = async (s: SolicitacaoPendente) => {
    if (!confirm('Rejeitar esta solicitação?')) return;
    setProcessingId(s.id);
    setError(null);
    try {
      const { data, error: fnError } = await supabaseClient.functions.invoke(
        'rejeitar-solicitacao',
        { body: { perfil_id: s.id } }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setSolicitacoes((prev) => prev.filter((x) => x.id !== s.id));
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao rejeitar');
    } finally {
      setProcessingId(null);
    }
  };

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
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Caixa de Entrada
                  {solicitacoes.length > 0 && (
                    <span className="ml-2 text-sm font-medium text-amber-500 dark:text-amber-400">
                      ({solicitacoes.length} pendente{solicitacoes.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
                  </div>
                ) : error ? (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : solicitacoes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Nenhuma solicitação pendente.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {solicitacoes.map((s) => (
                        <motion.div
                          key={s.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                              <p className="font-semibold text-gray-900 dark:text-white">{s.nome_completo || s.email}</p>
                              <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                                {s.email && (
                                  <li className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-500 shrink-0" />
                                    {s.email}
                                  </li>
                                )}
                                {s.whatsapp && (
                                  <li className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-500 shrink-0" />
                                    {s.whatsapp}
                                  </li>
                                )}
                                <li className="flex items-center gap-2">
                                  <BookOpen size={14} className="text-indigo-400/80 shrink-0" />
                                  <span>{s.nome_turma || '—'}</span>
                                  <span className="font-mono text-indigo-400">/t/{s.slug_desejado || '—'}</span>
                                </li>
                              </ul>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <motion.button
                                type="button"
                                onClick={() => handleAprovar(s)}
                                disabled={!!processingId}
                                whileHover={!processingId ? { scale: 1.02 } : undefined}
                                whileTap={!processingId ? { scale: 0.98 } : undefined}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 disabled:opacity-60 transition-colors"
                              >
                                {processingId === s.id ? (
                                  <Loader2 size={18} className="animate-spin" strokeWidth={2} />
                                ) : (
                                  <>
                                    <Check size={18} strokeWidth={2} />
                                    Aprovar
                                  </>
                                )}
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => handleRejeitar(s)}
                                disabled={!!processingId}
                                whileHover={!processingId ? { scale: 1.02 } : undefined}
                                whileTap={!processingId ? { scale: 0.98 } : undefined}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 font-medium text-sm hover:bg-red-500/10 disabled:opacity-60 transition-colors"
                              >
                                <X size={18} strokeWidth={2} />
                                Rejeitar
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
