import { useAuth } from '../context/AuthContext';
import { useGodMode } from '../context/GodModeContext';
import { TurmaProvider } from '../context/TurmaContext';
import { AppProvider } from '../context/AppContext';
import { DelegadoView } from '../pages/DelegadoView';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function DelegadoContent() {
  return (
    <AppProvider>
      <DelegadoView />
    </AppProvider>
  );
}

export function DelegadoRoute() {
  const { profile, profileLoading } = useAuth();
  const { godModeTurmaId } = useGodMode();

  const turmaId = godModeTurmaId ?? profile?.turma_id ?? null;

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
          <span className="text-sm text-gray-500 dark:text-zinc-500">Carregando...</span>
        </motion.div>
      </div>
    );
  }

  if (!turmaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-6"
        >
          <p className="text-gray-600 dark:text-zinc-400">
            Você não possui turma atribuída. Contate o administrador.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <TurmaProvider turmaId={turmaId} slug={null}>
      <DelegadoContent />
    </TurmaProvider>
  );
}
