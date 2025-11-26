import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type ElectronAPI } from '../shared/types/ipc';
import type { ReadingProgress } from '../shared/types/progress';
import type { Note, Highlight } from '../shared/types/notes';
import type { Settings } from '../shared/types/settings';

const api: ElectronAPI = {
  // Books
  importBook: (filePath: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_IMPORT, filePath),
  getBooks: () => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_GET_ALL),
  getBook: (id: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.BOOKS_GET, id),
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
  openFileDialog: () => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_DIALOG),

  // Settings
  getSettings: () => 
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  saveSettings: (settings: Partial<Settings>) => 
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, settings),
};

contextBridge.exposeInMainWorld('api', api);
