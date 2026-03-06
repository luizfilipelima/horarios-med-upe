import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { StudentView } from './pages/StudentView';
import { DelegadoView } from './pages/DelegadoView';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentView />} />
          <Route path="/delegado" element={<DelegadoView />} />
        </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
