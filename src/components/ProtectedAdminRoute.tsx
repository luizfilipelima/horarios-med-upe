import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { AdminView } from '../pages/AdminView';

export function ProtectedAdminRoute() {
  const { session, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
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

  if (!session) {
    return <LoginPage />;
  }

  if (profile?.role !== 'ceo') {
    return <Navigate to="/login" replace />;
  }

  return <AdminView />;
}
