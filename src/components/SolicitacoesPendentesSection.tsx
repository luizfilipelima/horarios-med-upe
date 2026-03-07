import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, Inbox, Phone, Mail, BookOpen } from 'lucide-react';
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

export function SolicitacoesPendentesSection({ onSuccess }: { onSuccess: () => void }) {
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
      setError(
        e instanceof Error ? e.message : 'Erro ao carregar solicitações.'
      );
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const handleAprovar = async (s: SolicitacaoPendente) => {
    if (!s.nome_turma?.trim() || !s.slug_desejado?.trim()) return;
    setProcessingId(s.id);
    setError(null);
    try {
      const slug = s.slug_desejado.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { data: newTurma, error: errTurma } = await supabaseClient
        .from('turmas')
        .insert({ nome: s.nome_turma.trim(), faculdade: '', slug_url: slug })
        .select('id')
        .single();

      if (errTurma || !newTurma) throw new Error(errTurma?.message ?? 'Erro ao criar turma');

      await supabaseClient.from('configuracoes').insert({
        turma_id: newTurma.id,
        titulo: s.nome_turma.trim(),
        subtitulo: '',
        link_drive: 'https://drive.google.com',
        link_plataforma: 'https://campus.upe.edu.py:86/moodle/my/courses.php',
        ativar_sabado: false,
        ativar_domingo: false,
        array_de_grupos: ['Grupo 1'],
      });

      const { error: errPerfil } = await supabaseClient
        .from('perfis')
        .update({ status: 'aprovado', turma_id: newTurma.id })
        .eq('id', s.id);

      if (errPerfil) throw errPerfil;

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
      const { error: err } = await supabaseClient
        .from('perfis')
        .update({ status: 'rejeitado' })
        .eq('id', s.id);

      if (err) throw err;

      setSolicitacoes((prev) => prev.filter((x) => x.id !== s.id));
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao rejeitar');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && solicitacoes.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Inbox size={20} className="text-indigo-400" strokeWidth={2} />
          <h2 className="text-lg font-bold text-white">Caixa de Entrada</h2>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 py-12 flex justify-center">
          <Loader2 size={28} className="text-indigo-500 animate-spin" strokeWidth={2} />
        </div>
      </motion.section>
    );
  }

  if (solicitacoes.length === 0 && !error) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Inbox size={20} className="text-amber-400" strokeWidth={2} />
        <h2 className="text-lg font-bold text-white">Caixa de Entrada</h2>
        <span className="text-sm text-amber-400 font-medium">({solicitacoes.length} pendente{solicitacoes.length !== 1 ? 's' : ''})</span>
      </div>

      <div
        className={`rounded-2xl backdrop-blur-md p-4 sm:p-5 border transition-colors ${
          solicitacoes.length > 0
            ? 'bg-white/5 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
            : 'bg-white/5 border-white/10'
        }`}
      >
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {solicitacoes.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-slate-900/50 border border-white/5 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <p className="font-semibold text-white">{s.nome_completo || s.email}</p>
                    <ul className="space-y-1 text-sm text-slate-400">
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
      </div>
    </motion.section>
  );
}
