import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StudentView } from './pages/StudentView';
import { ProtectedDelegadoRoute } from './components/ProtectedDelegadoRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StudentView />} />
              <Route path="/delegado" element={<ProtectedDelegadoRoute />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
