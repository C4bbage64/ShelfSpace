import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type ElectronAPI } from '../shared/types/ipc';
import type { Book } from '../shared/types/book';
import type { ReadingProgress } from '../shared/types/progress';
import type { Note, Highlight } from '../shared/types/notes';
import type { Settings } from '../shared/types/settings';
import type { Shelf } from '../shared/types/shelf';

const api: ElectronAPI = {
  // Books
  importBook: (filePath: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_IMPORT, filePath),
  getBooks: () => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_GET_ALL),
  getBook: (id: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_GET, id),
  updateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author'>>) =>
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_UPDATE, id, updates),
  deleteBook: (id: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_DELETE, id),

  // Progress
  saveProgress: (progress: ReadingProgress) => 
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_SAVE, progress),
  getProgress: (bookId: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_GET, bookId),

  // Notes
  saveNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => 
    ipcRenderer.invoke(IPC_CHANNELS.NOTES_SAVE, note),
  getNotes: (bookId: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.NOTES_GET_ALL, bookId),
  deleteNote: (id: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.NOTES_DELETE, id),

  // Highlights
  saveHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => 
    ipcRenderer.invoke(IPC_CHANNELS.HIGHLIGHTS_SAVE, highlight),
  getHighlights: (bookId: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.HIGHLIGHTS_GET_ALL, bookId),
  deleteHighlight: (id: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.HIGHLIGHTS_DELETE, id),

  // Files
  getFilePath: (bookId: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_PATH, bookId),
  readFile: (bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, bookId),
  openFileDialog: () => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_DIALOG),

  // Settings
  getSettings: () => 
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: (settings: Partial<Settings>) => 
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, settings),
    
  // Reading Stats
  startReadingSession: (bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_START_SESSION, bookId),
  endReadingSession: (sessionId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_END_SESSION, sessionId),
  getBookStats: (bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_BOOK, bookId),
  getOverallStats: () =>
    ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_OVERALL),
  
  // Shelves
  getAllShelves: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_GET_ALL),
  createShelf: (name: string, color?: string, icon?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_CREATE, name, color, icon),
  renameShelf: (shelfId: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_RENAME, shelfId, newName),
  updateShelf: (shelfId: string, updates: Partial<Shelf>) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_UPDATE, shelfId, updates),
  deleteShelf: (shelfId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_DELETE, shelfId),
  getShelfBooks: (shelfId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_GET_BOOKS, shelfId),
  addBookToShelf: (shelfId: string, bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_ADD_BOOK, shelfId, bookId),
  removeBookFromShelf: (shelfId: string, bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_REMOVE_BOOK, shelfId, bookId),
  getBookShelves: (bookId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_GET_FOR_BOOK, bookId),
  getSmartShelves: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_GET_SMART),
  getSmartShelfBooks: (smartShelfId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELVES_GET_SMART_BOOKS, smartShelfId),
};

contextBridge.exposeInMainWorld('api', api);
