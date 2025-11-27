import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { ReadingProgress } from '../../shared/types/progress';
import { getDatabase } from '../db';

export function registerProgressHandlers(ipcMain: IpcMain): void {
  // Save reading progress
  ipcMain.handle(
    IPC_CHANNELS.PROGRESS_SAVE,
    async (_event, progress: ReadingProgress) => {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO progress (bookId, location, percentage, timestamp)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(
        progress.bookId,
        progress.location,
        progress.percentage,
        new Date().toISOString()
      );

      // Update book's lastOpenedAt and progress column
      const updateBook = db.prepare(
        'UPDATE books SET lastOpenedAt = ?, progress = ? WHERE id = ?'
      );
      updateBook.run(new Date().toISOString(), progress.percentage / 100, progress.bookId);
    }
  );

  // Get reading progress
  ipcMain.handle(
    IPC_CHANNELS.PROGRESS_GET,
    async (_event, bookId: string) => {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM progress WHERE bookId = ?');
      return stmt.get(bookId) as ReadingProgress | undefined ?? null;
    }
  );
}
