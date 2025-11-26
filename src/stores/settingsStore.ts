import { create } from 'zustand';
import type { Settings, Theme } from '../../shared/types/settings';
import { DEFAULT_SETTINGS } from '../../shared/types/settings';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const settings = await window.api.getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates: Partial<Settings>) => {
    try {
      const newSettings = await window.api.saveSettings(updates);
      set({ settings: newSettings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  setTheme: async (theme: Theme) => {
    await get().updateSettings({ theme });
  },
}));
