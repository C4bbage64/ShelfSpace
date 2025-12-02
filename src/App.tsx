import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { useShelvesStore } from './stores/shelvesStore';
import Sidebar from './components/Sidebar';
import { ShelfSidebar } from './components/ShelfSidebar';
import { AddShelfModal } from './components/AddShelfModal';
import { UpdateNotification } from './components/UpdateNotification';
import Library from './pages/Library';
import Reader from './pages/Reader';
import Settings from './pages/Settings';
import { ShelfView } from './pages/ShelfView';

function App() {
  const { settings, loadSettings } = useSettingsStore();
  const { createShelf } = useShelvesStore();
  const [showAddShelfModal, setShowAddShelfModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleCreateShelf = async (name: string, color: string, icon: string) => {
    await createShelf(name, color, icon);
  };

  return (
    <div className={`app theme-${settings.theme}`}>
      <UpdateNotification />
      <Sidebar />
      <ShelfSidebar onCreateShelf={() => setShowAddShelfModal(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/library" element={<Library />} />
          <Route path="/shelf/:shelfId" element={<ShelfView />} />
          <Route path="/reader/:bookId" element={<Reader />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <AddShelfModal
        isOpen={showAddShelfModal}
        onClose={() => setShowAddShelfModal(false)}
        onSubmit={handleCreateShelf}
      />
    </div>
  );
}

export default App;
