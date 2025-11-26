import type Database from 'better-sqlite3';

// SQL schema definitions
export const SCHEMA = {
  books: `
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT DEFAULT 'Unknown',
      type TEXT NOT NULL CHECK (type IN ('pdf', 'epub', 'txt')),
      pages INTEGER,
      coverPath TEXT,
      filePath TEXT NOT NULL,
      importedAt TEXT NOT NULL,
      lastOpenedAt TEXT
    )
  `,
  
  progress: `
    CREATE TABLE IF NOT EXISTS progress (
      bookId TEXT PRIMARY KEY,
      location TEXT NOT NULL,
      percentage REAL DEFAULT 0,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )
  `,
  
  notes: `
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      content TEXT NOT NULL,
      location TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )
  `,
  
  highlights: `
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      text TEXT NOT NULL,
      location TEXT NOT NULL,
      color TEXT DEFAULT '#ffff00',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )
  `,
  
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `,
  
  migrations: `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL
    )
  `,
};

// Create indexes for better query performance
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)',
  'CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)',
  'CREATE INDEX IF NOT EXISTS idx_books_lastOpenedAt ON books(lastOpenedAt)',
  'CREATE INDEX IF NOT EXISTS idx_notes_bookId ON notes(bookId)',
  'CREATE INDEX IF NOT EXISTS idx_highlights_bookId ON highlights(bookId)',
];

export function createSchema(db: Database.Database): void {
  // Create tables
  Object.values(SCHEMA).forEach((sql) => {
    db.exec(sql);
  });

  // Create indexes
  INDEXES.forEach((sql) => {
    db.exec(sql);
  });
}
