import { Navigate, Route, Routes } from 'react-router-dom';
import CreateLegacy from './pages/CreateLegacy.jsx';
import LegacyPage from './pages/LegacyPage.jsx';
import { useTheme } from './context/ThemeContext.jsx';

const App = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Routes>
        <Route path="/" element={<CreateLegacy />} />
        <Route path="/legacy/:slug" element={<LegacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
