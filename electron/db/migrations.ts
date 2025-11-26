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
