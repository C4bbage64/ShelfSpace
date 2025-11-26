import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Book, BookImportResult } from '../../shared/types/book';
import { getDatabase } from '../db';
import {
  copyBookToVault,
  saveBookMeta,
} from './vault';
import {
  extractPdfMetadata,
  extractEpubMetadata,
  extractTxtMetadata,
} from './coverExtractor';

type BookType = 'pdf' | 'epub' | 'txt';

const SUPPORTED_EXTENSIONS: Record<string, BookType> = {
  '.pdf': 'pdf',
  '.epub': 'epub',
  '.txt': 'txt',
};

function getBookType(filePath: string): BookType | null {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] || null;
}

async function extractMetadata(
  filePath: string,
  type: BookType
): Promise<{ title?: string; author?: string; pages?: number }> {
  switch (type) {
    case 'pdf':
      return extractPdfMetadata(filePath);
    case 'epub':
      return extractEpubMetadata(filePath);
    case 'txt':
      return extractTxtMetadata(filePath);
    default:
      return {};
  }
}

export async function importBook(sourcePath: string): Promise<BookImportResult> {
  try {
    // Validate file type
    const type = getBookType(sourcePath);
    if (!type) {
      return {
        success: false,
        error: `Unsupported file type. Supported: ${Object.keys(SUPPORTED_EXTENSIONS).join(', ')}`,
      };
    }

    // Generate unique ID
    const id = uuidv4();

    // Extract metadata
    const metadata = await extractMetadata(sourcePath, type);
    const fileName = path.basename(sourcePath, path.extname(sourcePath));

    // Copy file to vault
    const vaultPath = await copyBookToVault(sourcePath, id, type);

    // Create book record
    const now = new Date().toISOString();
    const book: Book = {
      id,
      title: metadata.title || fileName,
      author: metadata.author || 'Unknown',
      type,
      pages: metadata.pages,
      coverPath: null, // Cover will be generated in renderer
      filePath: vaultPath,
      importedAt: now,
      lastOpenedAt: null,
    };

    // Save metadata file
    await saveBookMeta(id, book);

    // Insert into database
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO books (id, title, author, type, pages, coverPath, filePath, importedAt, lastOpenedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      book.id,
      book.title,
      book.author,
      book.type,
      book.pages ?? null,
      book.coverPath,
      book.filePath,
      book.importedAt,
      book.lastOpenedAt
    );

    return { success: true, book };
  } catch (error) {
    console.error('Error importing book:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export function getAllBooks(): Book[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM books ORDER BY lastOpenedAt DESC NULLS LAST, importedAt DESC');
  return stmt.all() as Book[];
}

export function getBook(id: string): Book | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  return (stmt.get(id) as Book) || null;
}

export function updateBookLastOpened(id: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE books SET lastOpenedAt = ? WHERE id = ?');
  stmt.run(new Date().toISOString(), id);
}

export function deleteBook(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM books WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
