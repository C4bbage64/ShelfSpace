import { useSettingsStore } from '../stores/settingsStore';
import type { Theme } from '../../shared/types/settings';
import './Settings.css';

function Settings() {
  const { settings, updateSettings } = useSettingsStore();

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  const handleReaderThemeChange = (readerTheme: Theme) => {
    updateSettings({ readerTheme });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fontSize = parseInt(e.target.value, 10);
    updateSettings({ fontSize });
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-sections">
        <section className="settings-section">
          <h2 className="section-title">Appearance</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">App Theme</label>
              <p className="setting-description">Choose the overall color scheme for the application.</p>
            </div>
            <div className="theme-options">
              <button
                className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <div className="theme-preview dark">
                  <span>🌙</span>
                </div>
                <span>Dark</span>
              </button>
              <button
                className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <div className="theme-preview light">
                  <span>☀️</span>
                </div>
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${settings.theme === 'sepia' ? 'active' : ''}`}
                onClick={() => handleThemeChange('sepia')}
              >
                <div className="theme-preview sepia">
                  <span>📜</span>
                </div>
                <span>Sepia</span>
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Reader</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Reader Theme</label>
              <p className="setting-description">Choose the color scheme for the book reader.</p>
            </div>
            <div className="theme-options">
              <button
                className={`theme-option ${settings.readerTheme === 'light' ? 'active' : ''}`}
                onClick={() => handleReaderThemeChange('light')}
              >
                <div className="theme-preview light">
                  <span>☀️</span>
                </div>
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${settings.readerTheme === 'dark' ? 'active' : ''}`}
                onClick={() => handleReaderThemeChange('dark')}
              >
                <div className="theme-preview dark">
                  <span>🌙</span>
                </div>
                <span>Dark</span>
              </button>
              <button
                className={`theme-option ${settings.readerTheme === 'sepia' ? 'active' : ''}`}
                onClick={() => handleReaderThemeChange('sepia')}
              >
                <div className="theme-preview sepia">
                  <span>📜</span>
                </div>
                <span>Sepia</span>
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Font Size</label>
              <p className="setting-description">Adjust the text size in the reader.</p>
            </div>
            <div className="font-size-control">
              <span className="font-size-value">{settings.fontSize}px</span>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={handleFontSizeChange}
                className="font-size-slider"
                aria-label="Font size"
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">About</h2>
          <div className="about-info">
            <p><strong>ShelfSpace</strong> v1.0.0</p>
            <p>An offline-first desktop reading application.</p>
            <p className="copyright">© 2025 ShelfSpace</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
