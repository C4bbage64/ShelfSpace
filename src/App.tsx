import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import Sidebar from './components/Sidebar';
import Library from './pages/Library';
import Reader from './pages/Reader';
import Settings from './pages/Settings';

function App() {
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className={`app theme-${settings.theme}`}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/reader/:bookId" element={<Reader />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
