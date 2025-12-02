import { useState, useEffect } from 'react';
import './ReaderSettings.css';

export interface ReaderPreferences {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  textAlign: 'left' | 'center' | 'justify';
  margins: number;
}

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSize: 18,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.8,
  theme: 'dark',
  textAlign: 'justify',
  margins: 40,
};

const FONT_OPTIONS = [
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'System', value: 'system-ui, sans-serif' },
];

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ReaderPreferences;
  onPreferencesChange: (prefs: ReaderPreferences) => void;
}

export function getDefaultPreferences(): ReaderPreferences {
  const saved = localStorage.getItem('readerPreferences');
  if (saved) {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
  return DEFAULT_PREFERENCES;
}

export function ReaderSettings({
  isOpen,
  onClose,
  preferences,
  onPreferencesChange,
}: ReaderSettingsProps) {
  const updatePreference = <K extends keyof ReaderPreferences>(
    key: K,
    value: ReaderPreferences[K]
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    onPreferencesChange(newPrefs);
    localStorage.setItem('readerPreferences', JSON.stringify(newPrefs));
  };

  if (!isOpen) return null;

  return (
    <div className="reader-settings-overlay" onClick={onClose}>
      <div className="reader-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <h3>Reading Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <label>Font Size</label>
          <div className="settings-control">
            <button
              onClick={() => updatePreference('fontSize', Math.max(12, preferences.fontSize - 2))}
              disabled={preferences.fontSize <= 12}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="value">{preferences.fontSize}px</span>
            <button
              onClick={() => updatePreference('fontSize', Math.min(32, preferences.fontSize + 2))}
              disabled={preferences.fontSize >= 32}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label>Font Family</label>
          <select
            value={preferences.fontFamily}
            onChange={(e) => updatePreference('fontFamily', e.target.value)}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-section">
          <label>Line Height</label>
          <div className="settings-control">
            <button
              onClick={() => updatePreference('lineHeight', Math.max(1.2, +(preferences.lineHeight - 0.2).toFixed(1)))}
              disabled={preferences.lineHeight <= 1.2}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="value">{preferences.lineHeight.toFixed(1)}</span>
            <button
              onClick={() => updatePreference('lineHeight', Math.min(2.5, +(preferences.lineHeight + 0.2).toFixed(1)))}
              disabled={preferences.lineHeight >= 2.5}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label>Theme</label>
          <div className="theme-buttons">
            <button
              className={`theme-btn light ${preferences.theme === 'light' ? 'active' : ''}`}
              onClick={() => updatePreference('theme', 'light')}
              title="Light"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
            <button
              className={`theme-btn sepia ${preferences.theme === 'sepia' ? 'active' : ''}`}
              onClick={() => updatePreference('theme', 'sepia')}
              title="Sepia"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </button>
            <button
              className={`theme-btn dark ${preferences.theme === 'dark' ? 'active' : ''}`}
              onClick={() => updatePreference('theme', 'dark')}
              title="Dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label>Text Alignment</label>
          <div className="align-buttons">
            <button
              className={preferences.textAlign === 'left' ? 'active' : ''}
              onClick={() => updatePreference('textAlign', 'left')}
              title="Left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
            </button>
            <button
              className={preferences.textAlign === 'center' ? 'active' : ''}
              onClick={() => updatePreference('textAlign', 'center')}
              title="Center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="18" y1="10" x2="6" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="18" y1="18" x2="6" y2="18" />
              </svg>
            </button>
            <button
              className={preferences.textAlign === 'justify' ? 'active' : ''}
              onClick={() => updatePreference('textAlign', 'justify')}
              title="Justify"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label>Margins: {preferences.margins}px</label>
          <input
            type="range"
            min="20"
            max="100"
            value={preferences.margins}
            onChange={(e) => updatePreference('margins', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
