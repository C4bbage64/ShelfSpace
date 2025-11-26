import type { IpcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { IPC_CHANNELS } from '../../shared/types/ipc';
import type { Note, Highlight } from '../../shared/types/notes';
import { getDatabase } from '../db';

export function registerNotesHandlers(ipcMain: IpcMain): void {
  // Save note (create or update)
  ipcMain.handle(
    IPC_CHANNELS.NOTES_SAVE,
    async (
      _event,
      note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
    ) => {
      const db = getDatabase();
      const now = new Date().toISOString();

      if (note.id) {
        // Update existing note
        const stmt = db.prepare(`
          UPDATE notes SET content = ?, location = ?, updatedAt = ?
          WHERE id = ?
        `);
        stmt.run(note.content, note.location ?? null, now, note.id);

        const getStmt = db.prepare('SELECT * FROM notes WHERE id = ?');
        return getStmt.get(note.id) as Note;
      } else {
        // Create new note
        const id = uuidv4();
        const stmt = db.prepare(`
          INSERT INTO notes (id, bookId, content, location, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, note.bookId, note.content, note.location ?? null, now, now);

        return {
          id,
          bookId: note.bookId,
          content: note.content,
          location: note.location,
          createdAt: now,
          updatedAt: now,
        } as Note;
      }
    }
  );

  // Get all notes for a book
  ipcMain.handle(
    IPC_CHANNELS.NOTES_GET_ALL,
    async (_event, bookId: string) => {
      const db = getDatabase();
      const stmt = db.prepare(
        'SELECT * FROM notes WHERE bookId = ? ORDER BY createdAt DESC'
      );
      return stmt.all(bookId) as Note[];
    }
  );

  // Delete a note
  ipcMain.handle(IPC_CHANNELS.NOTES_DELETE, async (_event, id: string) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  });

  // Save highlight
  ipcMain.handle(
    IPC_CHANNELS.HIGHLIGHTS_SAVE,
    async (_event, highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
      const db = getDatabase();
      const id = uuidv4();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO highlights (id, bookId, text, location, color, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        highlight.bookId,
        highlight.text,
        highlight.location,
        highlight.color,
        now
      );

      return {
        id,
        ...highlight,
        createdAt: now,
      } as Highlight;
    }
  );

  // Get all highlights for a book
  ipcMain.handle(
    IPC_CHANNELS.HIGHLIGHTS_GET_ALL,
    async (_event, bookId: string) => {
      const db = getDatabase();
      const stmt = db.prepare(
        'SELECT * FROM highlights WHERE bookId = ? ORDER BY createdAt DESC'
      );
      return stmt.all(bookId) as Highlight[];
    }
  );

  // Delete a highlight
  ipcMain.handle(IPC_CHANNELS.HIGHLIGHTS_DELETE, async (_event, id: string) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM highlights WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  });
}
