import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Check, Phone, Mail, BookOpen, User } from 'lucide-react';
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

function toWhatsAppUrl(whatsapp: string | null | undefined): string | null {
  if (!whatsapp?.trim()) return null;
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const full = digits.startsWith('55') || digits.startsWith('595') ? digits : '55' + digits;
  return `https://wa.me/${full}`;
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

      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const loginUrl = base ? `${base}/login` : '/login';
      const turmaUrl = base && s.slug_desejado ? `${base}/t/${s.slug_desejado.trim()}` : undefined;
      try {
        await sendApprovalEmail(
          s.email,
          s.nome_completo || 'Delegado(a)',
          s.nome_turma || 'sua turma',
          loginUrl,
          turmaUrl
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-xl sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Caixa de Entrada
                  {solicitacoes.length > 0 && (
                    <span className="ml-2 text-sm font-medium text-amber-500 dark:text-amber-400">
                      {solicitacoes.length} pendente{solicitacoes.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2.5 rounded-full text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 min-h-0 scrollbar-hide">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 size={36} className="text-indigo-500 animate-spin" strokeWidth={2} />
                    <span className="text-sm text-slate-500 dark:text-zinc-400">Carregando solicitações...</span>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-4 text-sm">
                    {error}
                  </div>
                ) : solicitacoes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <Mail size={24} className="text-slate-400 dark:text-zinc-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">Nenhuma solicitação pendente</p>
                    <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">Novas solicitações aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {solicitacoes.map((s) => (
                        <motion.article
                          key={s.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                          className="rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 overflow-hidden"
                        >
                          <div className="p-4 sm:p-5">
                            {/* Nome + ações (mobile: stack, desktop: row) */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-4">
                                {/* Nome */}
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <User size={20} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                                  </div>
                                  <p className="font-bold text-gray-900 dark:text-zinc-100 text-base truncate">
                                    {s.nome_completo || s.email || '—'}
                                  </p>
                                </div>

                                {/* Info grid */}
                                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                                  {s.email && (
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <Mail size={16} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" strokeWidth={2} />
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">E-mail</p>
                                        <p className="text-sm text-gray-700 dark:text-zinc-200 truncate" title={s.email}>{s.email}</p>
                                      </div>
                                    </div>
                                  )}
                                  {s.whatsapp && (
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <Phone size={16} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" strokeWidth={2} />
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">WhatsApp</p>
                                        {toWhatsAppUrl(s.whatsapp) ? (
                                          <a
                                                            href={toWhatsAppUrl(s.whatsapp)!}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                                                          >
                                                            {s.whatsapp}
                                                          </a>
                                        ) : (
                                          <p className="text-sm text-gray-700 dark:text-zinc-200 truncate">{s.whatsapp}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2.5 min-w-0 sm:col-span-2">
                                    <BookOpen size={16} className="text-indigo-500/80 shrink-0 mt-0.5" strokeWidth={2} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Turma solicitada</p>
                                      <p className="text-sm text-gray-700 dark:text-zinc-200">
                                        {s.nome_turma || '—'}{' '}
                                        <span className="font-mono text-indigo-600 dark:text-indigo-400">/t/{s.slug_desejado || '—'}</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-stretch gap-2 sm:flex-col sm:min-w-[140px] shrink-0">
                                <motion.button
                                  type="button"
                                  onClick={() => handleAprovar(s)}
                                  disabled={!!processingId}
                                  whileHover={!processingId ? { scale: 1.02 } : undefined}
                                  whileTap={!processingId ? { scale: 0.98 } : undefined}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-60 transition-colors min-h-[44px]"
                                >
                                  {processingId === s.id ? (
                                    <Loader2 size={18} className="animate-spin" strokeWidth={2} />
                                  ) : (
                                    <>
                                      <Check size={18} strokeWidth={2.5} />
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
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl border-2 border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 transition-colors min-h-[44px]"
                                >
                                  <X size={18} strokeWidth={2.5} />
                                  Rejeitar
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.article>
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
