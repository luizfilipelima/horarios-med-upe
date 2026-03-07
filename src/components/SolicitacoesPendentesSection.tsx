import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, Clock, Phone, Mail, BookOpen } from 'lucide-react';
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
        e instanceof Error ? e.message : 'Erro ao carregar. Verifique se a Edge Function listar-solicitacoes-pendentes está implantada.'
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

      const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
      await sendApprovalEmail(
        s.email,
        s.nome_completo || 'Delegado(a)',
        s.nome_turma || 'sua turma',
        loginUrl
      );

      onSuccess();
      fetchSolicitacoes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao aprovar');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeitar = async (s: SolicitacaoPendente) => {
    if (!confirm('Rejeitar esta solicitação? O usuário será informado.')) return;
    setProcessingId(s.id);
    setError(null);
    try {
      const { error: err } = await supabaseClient
        .from('perfis')
        .update({ status: 'rejeitado' })
        .eq('id', s.id);

      if (err) throw err;
      onSuccess();
      fetchSolicitacoes();
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
        className="mb-8"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4">
          Solicitações Pendentes
        </h2>
        <div className="flex justify-center py-8 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700">
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
      className="mb-8"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <Clock size={20} strokeWidth={2} className="text-amber-500" />
        Solicitações Pendentes ({solicitacoes.length})
      </h2>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
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
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100">
                    {s.nome_completo || s.email}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500 dark:text-zinc-500">
                    {s.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {s.email}
                      </span>
                    )}
                    {s.whatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {s.whatsapp}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen size={14} className="text-indigo-500 shrink-0" />
                    <span className="text-gray-600 dark:text-zinc-400">{s.nome_turma || '—'}</span>
                    <span className="font-mono text-gray-500 dark:text-zinc-500">
                      /t/{s.slug_desejado || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    type="button"
                    onClick={() => handleAprovar(s)}
                    disabled={!!processingId}
                    whileHover={!processingId ? { scale: 1.02 } : undefined}
                    whileTap={!processingId ? { scale: 0.98 } : undefined}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 disabled:opacity-60 transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-500/50 text-red-500 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60 transition-colors"
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
    </motion.section>
  );
}
