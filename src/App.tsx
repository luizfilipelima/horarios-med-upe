import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GodModeProvider } from './context/GodModeContext';
import { LoginPage } from './pages/LoginPage';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { ProtectedDelegadoRoute } from './components/ProtectedDelegadoRoute';
import { StudentRoute } from './components/StudentRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GodModeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<ProtectedAdminRoute />} />
              <Route path="/delegado" element={<ProtectedDelegadoRoute />} />
              <Route path="/t/:slug" element={<StudentRoute />} />
            </Routes>
          </BrowserRouter>
        </GodModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
