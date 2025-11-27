import type Database from 'better-sqlite3';
import { createSchema } from './schema';
import { DEFAULT_SETTINGS } from '../../shared/types/settings';

interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    id: 1,
    name: 'initial_schema',
    up: (db: Database.Database) => {
      createSchema(db);
      
      // Insert default settings
      const insertSetting = db.prepare(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
      );
      
      Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
        insertSetting.run(key, JSON.stringify(value));
      });
    },
  },
  {
    id: 2,
    name: 'add_reading_sessions',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS reading_sessions (
          id TEXT PRIMARY KEY,
          bookId TEXT NOT NULL,
          startTime TEXT NOT NULL,
          endTime TEXT,
          durationMinutes INTEGER DEFAULT 0,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
      `);
      db.exec('CREATE INDEX IF NOT EXISTS idx_reading_sessions_bookId ON reading_sessions(bookId)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_reading_sessions_startTime ON reading_sessions(startTime)');
    },
  },
  {
    id: 3,
    name: 'add_shelves_system',
    up: (db: Database.Database) => {
      // Add progress column to books table
      db.exec(`
        ALTER TABLE books ADD COLUMN progress REAL DEFAULT 0
      `);
      
      // Create shelves table
      db.exec(`
        CREATE TABLE IF NOT EXISTS shelves (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT DEFAULT '#3b82f6',
          icon TEXT DEFAULT '📚',
          createdAt TEXT NOT NULL
        )
      `);
      
      // Create book_shelf junction table (many-to-many)
      db.exec(`
        CREATE TABLE IF NOT EXISTS book_shelf (
          id TEXT PRIMARY KEY,
          bookId TEXT NOT NULL,
          shelfId TEXT NOT NULL,
          addedAt TEXT NOT NULL,
          FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (shelfId) REFERENCES shelves(id) ON DELETE CASCADE,
          UNIQUE(bookId, shelfId)
        )
      `);
      
      // Create indexes for better query performance
      db.exec('CREATE INDEX IF NOT EXISTS idx_shelves_name ON shelves(name)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_book_shelf_bookId ON book_shelf(bookId)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_book_shelf_shelfId ON book_shelf(shelfId)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_books_progress ON books(progress)');
    },
  },
];

export function runMigrations(db: Database.Database): void {
  // Ensure migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL
    )
  `);

  // Get applied migrations
  const appliedMigrations = db
    .prepare('SELECT id FROM migrations')
    .all() as { id: number }[];
  
  const appliedIds = new Set(appliedMigrations.map((m) => m.id));

  // Run pending migrations
  const insertMigration = db.prepare(
    'INSERT INTO migrations (id, name, appliedAt) VALUES (?, ?, ?)'
  );

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      console.log(`Running migration: ${migration.name}`);
      
      db.transaction(() => {
        migration.up(db);
        insertMigration.run(
          migration.id,
          migration.name,
          new Date().toISOString()
        );
      })();
      
      console.log(`Migration completed: ${migration.name}`);
    }
  }
}
