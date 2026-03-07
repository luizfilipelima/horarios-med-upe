import { useParams } from 'react-router-dom';
import { TurmaProvider } from '../context/TurmaContext';
import { AppProvider } from '../context/AppContext';
import { StudentView } from '../pages/StudentView';
import { SplashScreenLoader } from '../components/SplashScreenLoader';
import { useTurma } from '../context/TurmaContext';

function StudentContent() {
  const { turmaId, loading } = useTurma();

  if (loading) {
    return <SplashScreenLoader />;
  }

  if (!turmaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
        <div className="text-center px-6">
          <p className="text-gray-600 dark:text-zinc-400">Turma não encontrada.</p>
        </div>
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
