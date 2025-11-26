// IPC channel definitions and payload types
import type { Book, BookImportResult } from './book';
import type { ReadingProgress } from './progress';
import type { Note, Highlight } from './notes';
import type { Settings } from './settings';
import type { ReadingStats, BookReadingStats, ReadingSession } from './stats';

// IPC channel names
export const IPC_CHANNELS = {
  // Books
  BOOKS_IMPORT: 'books:import',
  BOOKS_GET_ALL: 'books:getAll',
  BOOKS_GET: 'books:get',
  BOOKS_UPDATE: 'books:update',
  BOOKS_DELETE: 'books:delete',
  
  // Progress
  PROGRESS_SAVE: 'progress:save',
  PROGRESS_GET: 'progress:get',
  
  // Notes
  NOTES_SAVE: 'notes:save',
  NOTES_GET_ALL: 'notes:getAll',
  NOTES_DELETE: 'notes:delete',
  
  // Highlights
  HIGHLIGHTS_SAVE: 'highlights:save',
  HIGHLIGHTS_GET_ALL: 'highlights:getAll',
  HIGHLIGHTS_DELETE: 'highlights:delete',
  
  // Reading Stats
  STATS_START_SESSION: 'stats:startSession',
  STATS_END_SESSION: 'stats:endSession',
  STATS_GET_BOOK: 'stats:getBook',
  STATS_GET_OVERALL: 'stats:getOverall',
  
  // Files
  FILE_GET_PATH: 'file:getPath',
  FILE_READ: 'file:read',
  FILE_OPEN_DIALOG: 'file:openDialog',
  
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
} as const;

// IPC API interface exposed to renderer
export interface ElectronAPI {
  // Books
  importBook: (filePath: string) => Promise<BookImportResult>;
  getBooks: () => Promise<Book[]>;
  getBook: (id: string) => Promise<Book | null>;
  updateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author'>>) => Promise<Book | null>;
  deleteBook: (id: string) => Promise<boolean>;
  
  // Progress
  saveProgress: (progress: ReadingProgress) => Promise<void>;
  getProgress: (bookId: string) => Promise<ReadingProgress | null>;
  
  // Notes
  saveNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Note>;
  getNotes: (bookId: string) => Promise<Note[]>;
  deleteNote: (id: string) => Promise<boolean>;
  
  // Highlights
  saveHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => Promise<Highlight>;
  getHighlights: (bookId: string) => Promise<Highlight[]>;
  deleteHighlight: (id: string) => Promise<boolean>;
  
  // Files
  getFilePath: (bookId: string) => Promise<string | null>;
  readFile: (bookId: string) => Promise<string | null>;
  openFileDialog: () => Promise<string[] | null>;
  
  // Settings
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Partial<Settings>) => Promise<Settings>;
  
  // Reading Stats
  startReadingSession: (bookId: string) => Promise<ReadingSession>;
  endReadingSession: (sessionId: string) => Promise<ReadingSession | null>;
  getBookStats: (bookId: string) => Promise<BookReadingStats>;
  getOverallStats: () => Promise<ReadingStats>;
}

// Augment window object
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
