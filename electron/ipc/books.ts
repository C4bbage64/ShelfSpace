import type { IpcMain } from 'electron';
import { dialog } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import {
  importBook,
  getAllBooks,
  getBook,
  deleteBook as deleteBookService,
} from '../services/bookImporter';
import { deleteBookFromVault } from '../services/vault';

export function registerBooksHandlers(ipcMain: IpcMain): void {
  // Import a book
  ipcMain.handle(IPC_CHANNELS.BOOKS_IMPORT, async (_event, filePath: string) => {
    return importBook(filePath);
  });

  // Get all books
  ipcMain.handle(IPC_CHANNELS.BOOKS_GET_ALL, async () => {
    return getAllBooks();
  });

  // Get a single book
  ipcMain.handle(IPC_CHANNELS.BOOKS_GET, async (_event, id: string) => {
    return getBook(id);
  });

  // Delete a book
  ipcMain.handle(IPC_CHANNELS.BOOKS_DELETE, async (_event, id: string) => {
    // Delete from database
    const deleted = deleteBookService(id);
    
    if (deleted) {
      // Delete from vault
      await deleteBookFromVault(id);
    }
    
    return deleted;
  });

  // Open file dialog for importing books
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Books',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Books', extensions: ['pdf', 'epub', 'txt'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'EPUB', extensions: ['epub'] },
        { name: 'Text', extensions: ['txt'] },
      ],
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths;
  });
}
