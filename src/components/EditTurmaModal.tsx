import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Pause, Play, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';

interface Turma {
  id: string;
  nome: string;
  faculdade: string;
  slug_url: string;
  ativa?: boolean;
}

interface EditTurmaModalProps {
  turma: Turma | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTurmaModal({ turma, isOpen, onClose, onSuccess }: EditTurmaModalProps) {
  const [loading, setLoading] = useState<'pause' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setConfirmDelete(false);
    setError(null);
    onClose();
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
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Editar Turma
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

              <div className="px-5 py-5 space-y-4">
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

                {!confirmDelete ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <EditTurmaModalPauseButton
                        turma={turma}
                        loading={loading}
                        setLoading={setLoading}
                        setError={setError}
                        onSuccess={onSuccess}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold text-sm transition-colors disabled:opacity-60"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                        Excluir turma
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                      Tem certeza que deseja excluir <strong className="text-gray-900 dark:text-zinc-100">{turma.nome}</strong>? 
                      Esta ação não pode ser desfeita. Aulas, eventos e configurações serão removidos.
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold text-sm"
                      >
                        Cancelar
                      </motion.button>
                      <EditTurmaModalDeleteButton
                        turmaId={turma.id}
                        loading={loading}
                        setLoading={setLoading}
                        setError={setError}
                        onSuccess={onSuccess}
                        onClose={handleClose}
                      />
                    </div>
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

function EditTurmaModalPauseButton({
  turma,
  loading,
  setLoading,
  setError,
  onSuccess,
}: {
  turma: Turma;
  loading: string | null;
  setLoading: (v: 'pause' | 'delete' | null) => void;
  setError: (v: string | null) => void;
  onSuccess: () => void;
}) {
  const isPaused = turma.ativa === false;

  const handleClick = async () => {
    setError(null);
    setLoading('pause');
    const { error } = await supabaseClient
      .from('turmas')
      .update({ ativa: !isPaused })
      .eq('id', turma.id);
    setLoading(null);
    if (error) {
      setError('A coluna "ativa" pode não existir. Execute supabase-add-ativa-turmas.sql no Supabase.');
      return;
    }
    onSuccess();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      disabled={!!loading}
      className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-60 ${
        isPaused
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20'
      }`}
    >
      {loading === 'pause' ? (
        <Loader2 size={18} strokeWidth={2} className="animate-spin" />
      ) : isPaused ? (
        <>
          <Play size={18} strokeWidth={2} />
          Reativar turma
        </>
      ) : (
        <>
          <Pause size={18} strokeWidth={2} />
          Pausar turma
        </>
      )}
    </motion.button>
  );
}

function EditTurmaModalDeleteButton({
  turmaId,
  loading,
  setLoading,
  setError,
  onSuccess,
  onClose,
}: {
  turmaId: string;
  loading: string | null;
  setLoading: (v: 'pause' | 'delete' | null) => void;
  setError: (v: string | null) => void;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const handleClick = async () => {
    setError(null);
    setLoading('delete');
    const { error } = await supabaseClient.from('turmas').delete().eq('id', turmaId);
    setLoading(null);
    if (error) {
      setError(error.message ?? 'Falha ao excluir. Tente novamente.');
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      disabled={!!loading}
      className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading === 'delete' ? (
        <Loader2 size={18} strokeWidth={2} className="animate-spin" />
      ) : (
        <>
          <Trash2 size={18} strokeWidth={2} />
          Excluir
        </>
      )}
    </motion.button>
  );
}
