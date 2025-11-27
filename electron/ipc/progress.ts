import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { ReadingProgress } from '../../shared/types/progress';
import { getDatabase } from '../db';

export function registerProgressHandlers(ipcMain: IpcMain): void {
  // Save reading progress
  ipcMain.handle(
    IPC_CHANNELS.PROGRESS_SAVE,
    async (_event, progress: ReadingProgress) => {
      try {
        const db = getDatabase();
        const timestamp = new Date().toISOString();
        
        // Save to progress table
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO progress (bookId, location, percentage, timestamp)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(
          progress.bookId,
          progress.location,
          progress.percentage,
          timestamp
        );

        // Update book's lastOpenedAt and progress column (convert percentage to 0-1)
        const progressValue = Math.min(Math.max(progress.percentage / 100, 0), 1);
        const updateBook = db.prepare(
          'UPDATE books SET lastOpenedAt = ?, progress = ? WHERE id = ?'
        );
        updateBook.run(timestamp, progressValue, progress.bookId);
      } catch (error) {
        console.error('Failed to save progress:', error);
        throw error;
      }
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
