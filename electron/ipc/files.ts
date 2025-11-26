import type { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import { getBook } from '../services/bookImporter';

export function registerFilesHandlers(ipcMain: IpcMain): void {
  // Get file path for a book
  ipcMain.handle(
    IPC_CHANNELS.FILE_GET_PATH,
    async (_event, bookId: string) => {
      const book = getBook(bookId);
      return book?.filePath ?? null;
    }
  );
}
