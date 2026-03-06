import { useParams } from 'react-router-dom';
import { TurmaProvider } from '../context/TurmaContext';
import { AppProvider } from '../context/AppContext';
import { StudentView } from '../pages/StudentView';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTurma } from '../context/TurmaContext';

function StudentContent() {
  const { turmaId, loading } = useTurma();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
          <span className="text-sm text-gray-500 dark:text-zinc-500">Carregando turma...</span>
        </motion.div>
      </div>
    );
  }

  if (!turmaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-6"
        >
          <p className="text-gray-600 dark:text-zinc-400">Turma não encontrada.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AppProvider>
      <StudentView />
    </AppProvider>
  );
}

export function StudentRoute() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
        <p className="text-gray-600 dark:text-zinc-400">Slug inválido.</p>
      </div>
    );
  }

  return (
    <TurmaProvider turmaId={null} slug={slug}>
      <StudentContent />
    </TurmaProvider>
  );
}
