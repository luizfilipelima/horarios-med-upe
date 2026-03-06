import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GodModeProvider } from './context/GodModeContext';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ConvitePage = lazy(() => import('./pages/ConvitePage').then(m => ({ default: m.ConvitePage })));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute').then(m => ({ default: m.ProtectedAdminRoute })));
const ProtectedDelegadoRoute = lazy(() => import('./components/ProtectedDelegadoRoute').then(m => ({ default: m.ProtectedDelegadoRoute })));
const StudentRoute = lazy(() => import('./components/StudentRoute').then(m => ({ default: m.StudentRoute })));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-sm text-gray-500 dark:text-zinc-500">Carregando…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GodModeProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/convite/:token" element={<ConvitePage />} />
                <Route path="/admin" element={<ProtectedAdminRoute />} />
                <Route path="/delegado" element={<ProtectedDelegadoRoute />} />
                <Route path="/t/:slug" element={<StudentRoute />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </GodModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
