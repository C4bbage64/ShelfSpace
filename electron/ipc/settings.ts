import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { Settings } from '../../shared/types/settings';
import { DEFAULT_SETTINGS } from '../../shared/types/settings';
import { getDatabase } from '../db';

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  // Get all settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as { key: string; value: string }[];

    const settings: Settings = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      try {
        if (row.key in settings) {
          (settings as unknown as Record<string, unknown>)[row.key] = JSON.parse(row.value);
        }
      } catch {
        // Ignore parse errors
      }
    }

    return settings;
  });

  // Save settings
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SAVE,
    async (_event, newSettings: Partial<Settings>) => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
      );

      for (const [key, value] of Object.entries(newSettings)) {
        stmt.run(key, JSON.stringify(value));
      }

      // Return updated settings
      const getStmt = db.prepare('SELECT key, value FROM settings');
      const rows = getStmt.all() as { key: string; value: string }[];

      const settings: Settings = { ...DEFAULT_SETTINGS };

      for (const row of rows) {
        try {
          if (row.key in settings) {
            (settings as unknown as Record<string, unknown>)[row.key] = JSON.parse(row.value);
          }
        } catch {
          // Ignore parse errors
        }
      }

      return settings;
    }
  );
}
