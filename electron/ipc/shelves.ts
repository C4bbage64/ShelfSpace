import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db';
import type { Shelf, ShelfWithBookCount, SmartShelfConfig } from '../../shared/types/shelf';
import type { Book } from '../../shared/types/book';
import { IpcChannel } from '../../shared/types/ipc';

// Smart Shelves Configuration
const SMART_SHELVES: SmartShelfConfig[] = [
  {
    id: 'smart-recent',
    name: 'Recently Added',
    icon: '🕐',
    color: '#10b981',
    query: (books: Book[]) => {
      return books
        .sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime())
        .slice(0, 20);
    },
  },
  {
    id: 'smart-progress',
    name: 'In Progress',
    icon: '📖',
    color: '#f59e0b',
    query: (books: Book[]) => {
      return books.filter((b: any) => {
        const progress = b.progress ?? 0;
        return progress > 0 && progress < 1;
      });
    },
  },
  {
    id: 'smart-unread',
    name: 'Unread',
    icon: '📚',
    color: '#6366f1',
    query: (books: Book[]) => {
      return books.filter((b: any) => {
        const progress = b.progress ?? 0;
        return progress === 0;
      });
    },
  },
  {
    id: 'smart-finished',
    name: 'Finished',
    icon: '✅',
    color: '#22c55e',
    query: (books: Book[]) => {
      return books.filter((b: any) => {
        const progress = b.progress ?? 0;
        return progress >= 1;
      });
    },
  },
  {
    id: 'smart-large',
    name: 'Large Files',
    icon: '📦',
    color: '#8b5cf6',
    query: (books: Book[]) => {
      return books.filter((b) => b.pages && b.pages > 300);
    },
  },
];

export function registerShelfHandlers(): void {
  // Get all shelves
  ipcMain.handle(IpcChannel.SHELVES_GET_ALL, async () => {
    try {
      const db = getDatabase();
      const shelves = db.prepare(`
        SELECT s.*, COUNT(bs.bookId) as bookCount
        FROM shelves s
        LEFT JOIN book_shelf bs ON s.id = bs.shelfId
        GROUP BY s.id
        ORDER BY s.createdAt DESC
      `).all() as ShelfWithBookCount[];
      
      return shelves;
    } catch (error) {
      console.error('Failed to get shelves:', error);
      throw error;
    }
  });

  // Create shelf
  ipcMain.handle(IpcChannel.SHELVES_CREATE, async (_, name: string, color?: string, icon?: string) => {
    try {
      const db = getDatabase();
      const shelf: Shelf = {
        id: uuidv4(),
        name,
        color: color || '#3b82f6',
        icon: icon || '📚',
        createdAt: new Date().toISOString(),
      };

      db.prepare(`
        INSERT INTO shelves (id, name, color, icon, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(shelf.id, shelf.name, shelf.color, shelf.icon, shelf.createdAt);

      return shelf;
    } catch (error) {
      console.error('Failed to create shelf:', error);
      throw error;
    }
  });

  // Rename shelf
  ipcMain.handle(IpcChannel.SHELVES_RENAME, async (_, shelfId: string, newName: string) => {
    try {
      const db = getDatabase();
      db.prepare('UPDATE shelves SET name = ? WHERE id = ?').run(newName, shelfId);
    } catch (error) {
      console.error('Failed to rename shelf:', error);
      throw error;
    }
  });

  // Update shelf
  ipcMain.handle(IpcChannel.SHELVES_UPDATE, async (_, shelfId: string, updates: Partial<Shelf>) => {
    try {
      const db = getDatabase();
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.color !== undefined) {
        fields.push('color = ?');
        values.push(updates.color);
      }
      if (updates.icon !== undefined) {
        fields.push('icon = ?');
        values.push(updates.icon);
      }

      if (fields.length > 0) {
        values.push(shelfId);
        db.prepare(`UPDATE shelves SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      }
    } catch (error) {
      console.error('Failed to update shelf:', error);
      throw error;
    }
  });

  // Delete shelf
  ipcMain.handle(IpcChannel.SHELVES_DELETE, async (_, shelfId: string) => {
    try {
      const db = getDatabase();
      // book_shelf entries will be automatically deleted due to CASCADE
      db.prepare('DELETE FROM shelves WHERE id = ?').run(shelfId);
    } catch (error) {
      console.error('Failed to delete shelf:', error);
      throw error;
    }
  });

  // Get books in shelf
  ipcMain.handle(IpcChannel.SHELVES_GET_BOOKS, async (_, shelfId: string) => {
    try {
      const db = getDatabase();
      const books = db.prepare(`
        SELECT b.*
        FROM books b
        INNER JOIN book_shelf bs ON b.id = bs.bookId
        WHERE bs.shelfId = ?
        ORDER BY bs.addedAt DESC
      `).all(shelfId) as Book[];
      
      return books;
    } catch (error) {
      console.error('Failed to get shelf books:', error);
      throw error;
    }
  });

  // Add book to shelf
  ipcMain.handle(IpcChannel.SHELVES_ADD_BOOK, async (_, shelfId: string, bookId: string) => {
    try {
      const db = getDatabase();
      const id = uuidv4();
      
      // Use INSERT OR IGNORE to handle duplicates gracefully
      db.prepare(`
        INSERT OR IGNORE INTO book_shelf (id, bookId, shelfId, addedAt)
        VALUES (?, ?, ?, ?)
      `).run(id, bookId, shelfId, new Date().toISOString());
    } catch (error) {
      console.error('Failed to add book to shelf:', error);
      throw error;
    }
  });

  // Remove book from shelf
  ipcMain.handle(IpcChannel.SHELVES_REMOVE_BOOK, async (_, shelfId: string, bookId: string) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM book_shelf WHERE shelfId = ? AND bookId = ?').run(shelfId, bookId);
    } catch (error) {
      console.error('Failed to remove book from shelf:', error);
      throw error;
    }
  });

  // Get shelves for a book
  ipcMain.handle(IpcChannel.SHELVES_GET_FOR_BOOK, async (_, bookId: string) => {
    try {
      const db = getDatabase();
      const shelves = db.prepare(`
        SELECT s.*
        FROM shelves s
        INNER JOIN book_shelf bs ON s.id = bs.shelfId
        WHERE bs.bookId = ?
        ORDER BY s.name
      `).all(bookId) as Shelf[];
      
      return shelves;
    } catch (error) {
      console.error('Failed to get book shelves:', error);
      throw error;
    }
  });

  // Get Smart Shelves
  ipcMain.handle(IpcChannel.SHELVES_GET_SMART, async () => {
    try {
      const db = getDatabase();
      const allBooks = db.prepare('SELECT * FROM books ORDER BY importedAt DESC').all() as Book[];
      
      const smartShelves = SMART_SHELVES.map((config) => {
        const books = config.query(allBooks);
        return {
          id: config.id,
          name: config.name,
          icon: config.icon,
          color: config.color,
          bookCount: books.length,
          isSmart: true,
          createdAt: new Date().toISOString(), // Add required field
        };
      });
      
      return smartShelves;
    } catch (error) {
      console.error('Failed to get smart shelves:', error);
      throw error;
    }
  });

  // Get Smart Shelf Books
  ipcMain.handle(IpcChannel.SHELVES_GET_SMART_BOOKS, async (_, smartShelfId: string) => {
    try {
      const db = getDatabase();
      const allBooks = db.prepare('SELECT * FROM books ORDER BY importedAt DESC').all() as Book[];
      
      const config = SMART_SHELVES.find((s) => s.id === smartShelfId);
      if (!config) {
        throw new Error(`Smart shelf not found: ${smartShelfId}`);
      }
      
      const filteredBooks = config.query(allBooks);
      return filteredBooks;
    } catch (error) {
      console.error('Failed to get smart shelf books:', error);
      throw error;
    }
  });
}
