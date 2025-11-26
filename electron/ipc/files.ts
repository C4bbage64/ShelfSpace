import type { IpcMain } from 'electron';
import fs from 'fs';
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

  // Read file data as base64 string (transfers reliably via IPC)
  ipcMain.handle(
    IPC_CHANNELS.FILE_READ,
    async (_event, bookId: string) => {
      const book = getBook(bookId);
      if (!book?.filePath) {
        console.error('Book not found or no file path:', bookId);
        return null;
      }
      
      try {
        if (!fs.existsSync(book.filePath)) {
          console.error('File does not exist:', book.filePath);
          return null;
        }
        
        const buffer = fs.readFileSync(book.filePath);
        console.log('Read file:', book.filePath, 'size:', buffer.length);
        // Return as base64 string for reliable IPC transfer
        return buffer.toString('base64');
      } catch (error) {
        console.error('Failed to read file:', book.filePath, error);
        return null;
      }
    }
  );
}
