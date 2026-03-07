import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GodModeProvider } from './context/GodModeContext';
import { SplashScreenLoader } from './components/SplashScreenLoader';

const loginLoader = () => import('./pages/LoginPage').then(m => ({ default: m.LoginPage }));
const LoginPage = lazy(loginLoader);
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage').then(m => ({ default: m.UpdatePasswordPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const CadastroSucessoPage = lazy(() => import('./pages/CadastroSucessoPage').then(m => ({ default: m.CadastroSucessoPage })));
const ConvitePage = lazy(() => import('./pages/ConvitePage').then(m => ({ default: m.ConvitePage })));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute').then(m => ({ default: m.ProtectedAdminRoute })));
const ProtectedDelegadoRoute = lazy(() => import('./components/ProtectedDelegadoRoute').then(m => ({ default: m.ProtectedDelegadoRoute })));
const StudentRoute = lazy(() => import('./components/StudentRoute').then(m => ({ default: m.StudentRoute })));

function RouteFallback() {
  return <SplashScreenLoader />;
}

export default function App() {
  useEffect(() => {
    loginLoader();
    // Pré-carrega a rota do aluno para reduzir suspense ao acessar /t/:slug
    import('./components/StudentRoute').catch(() => {});
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <GodModeProvider>
          <div className="min-h-screen min-w-full bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300">
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/cadastro-sucesso" element={<CadastroSucessoPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/convite/:token" element={<ConvitePage />} />
                <Route path="/admin" element={<ProtectedAdminRoute />} />
                <Route path="/delegado" element={<ProtectedDelegadoRoute />} />
                <Route path="/t/:slug" element={<StudentRoute />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </div>
        </GodModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
