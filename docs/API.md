# IPC API Reference

ShelfSpace uses Electron's IPC (Inter-Process Communication) to securely communicate between the main process (backend) and renderer process (frontend). All APIs are exposed through the `window.api` object via the preload script.

## Type Definitions

All IPC channels and types are defined in:
- `shared/types/ipc.ts` - Channel enums
- `shared/types/*.ts` - Data models

## Books API

### `importBook(filePath: string): Promise<Book>`

Imports a book file into the library.

**Parameters:**
- `filePath` (string) - Absolute path to the book file

**Returns:**
- `Promise<Book>` - Imported book object with metadata

**Example:**
```typescript
const book = await window.api.importBook('C:\\Users\\Documents\\book.pdf')
console.log(book.id, book.title, book.author)
```

**IPC Channel:** `BOOKS_IMPORT`

---

### `getBooks(): Promise<Book[]>`

Retrieves all books from the library.

**Returns:**
- `Promise<Book[]>` - Array of all books

**Example:**
```typescript
const books = await window.api.getBooks()
books.forEach(book => console.log(book.title))
```

**IPC Channel:** `BOOKS_GET_ALL`

---

### `updateBook(id: string, updates: Partial<Book>): Promise<void>`

Updates book metadata.

**Parameters:**
- `id` (string) - Book UUID
- `updates` (Partial<Book>) - Fields to update (title, author, etc.)

**Example:**
```typescript
await window.api.updateBook(bookId, {
  title: 'New Title',
  author: 'New Author'
})
```

**IPC Channel:** `BOOKS_UPDATE`

---

### `deleteBook(id: string): Promise<void>`

Permanently deletes a book and all associated data.

**Parameters:**
- `id` (string) - Book UUID

**Example:**
```typescript
await window.api.deleteBook(bookId)
```

**IPC Channel:** `BOOKS_DELETE`

**Side Effects:**
- Deletes book file from vault
- Deletes cover image
- Cascades to progress, notes, highlights, reading sessions

---

## Progress API

### `saveProgress(bookId: string, location: string, percentage: number): Promise<void>`

Saves reading progress for a book.

**Parameters:**
- `bookId` (string) - Book UUID
- `location` (string) - Current location (page number or EPUB CFI)
- `percentage` (number) - Progress percentage (0-100)

**Example:**
```typescript
await window.api.saveProgress(bookId, '42', 35.5)
```

**IPC Channel:** `PROGRESS_SAVE`

---

### `getProgress(bookId: string): Promise<Progress | null>`

Retrieves saved progress for a book.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<Progress | null>` - Progress object or null if not found

**Example:**
```typescript
const progress = await window.api.getProgress(bookId)
if (progress) {
  console.log(`Resume at page ${progress.location}`)
}
```

**IPC Channel:** `PROGRESS_GET`

---

## Notes API

### `saveNote(bookId: string, content: string, location?: string): Promise<Note>`

Creates or updates a note.

**Parameters:**
- `bookId` (string) - Book UUID
- `content` (string) - Note text
- `location` (string, optional) - Location in book

**Returns:**
- `Promise<Note>` - Created note object

**Example:**
```typescript
const note = await window.api.saveNote(bookId, 'Important insight', 'page 15')
console.log(note.id)
```

**IPC Channel:** `NOTES_SAVE`

---

### `getNotes(bookId: string): Promise<Note[]>`

Retrieves all notes for a book.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<Note[]>` - Array of notes

**Example:**
```typescript
const notes = await window.api.getNotes(bookId)
notes.forEach(note => console.log(note.content))
```

**IPC Channel:** `NOTES_GET`

---

### `deleteNote(id: string): Promise<void>`

Deletes a note.

**Parameters:**
- `id` (string) - Note UUID

**Example:**
```typescript
await window.api.deleteNote(noteId)
```

**IPC Channel:** `NOTES_DELETE`

---

## Highlights API

### `saveHighlight(bookId: string, text: string, location: string, color?: string): Promise<Highlight>`

Creates a text highlight.

**Parameters:**
- `bookId` (string) - Book UUID
- `text` (string) - Highlighted text
- `location` (string) - Location in book
- `color` (string, optional) - Hex color (default: '#ffff00')

**Returns:**
- `Promise<Highlight>` - Created highlight object

**Example:**
```typescript
const highlight = await window.api.saveHighlight(
  bookId,
  'Selected text',
  'page 10',
  '#00ff00'
)
```

**IPC Channel:** `HIGHLIGHTS_SAVE`

---

### `getHighlights(bookId: string): Promise<Highlight[]>`

Retrieves all highlights for a book.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<Highlight[]>` - Array of highlights

**Example:**
```typescript
const highlights = await window.api.getHighlights(bookId)
highlights.forEach(h => console.log(h.text, h.color))
```

**IPC Channel:** `HIGHLIGHTS_GET`

---

### `deleteHighlight(id: string): Promise<void>`

Deletes a highlight.

**Parameters:**
- `id` (string) - Highlight UUID

**Example:**
```typescript
await window.api.deleteHighlight(highlightId)
```

**IPC Channel:** `HIGHLIGHTS_DELETE`

---

## Statistics API

### `startReadingSession(bookId: string): Promise<string>`

Starts a new reading session.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<string>` - Session ID

**Example:**
```typescript
const sessionId = await window.api.startReadingSession(bookId)
// Store sessionId for later
```

**IPC Channel:** `STATS_START_SESSION`

---

### `endReadingSession(sessionId: string): Promise<void>`

Ends an active reading session.

**Parameters:**
- `sessionId` (string) - Session ID from `startReadingSession()`

**Example:**
```typescript
await window.api.endReadingSession(sessionId)
```

**IPC Channel:** `STATS_END_SESSION`

**Note:** Automatically calculates duration in minutes.

---

### `getBookStats(bookId: string): Promise<BookReadingStats | null>`

Retrieves reading statistics for a book.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<BookReadingStats | null>` - Stats object or null

**Example:**
```typescript
const stats = await window.api.getBookStats(bookId)
if (stats) {
  console.log(`Total time: ${stats.totalMinutes} minutes`)
  console.log(`Sessions: ${stats.sessionCount}`)
}
```

**IPC Channel:** `STATS_GET_BOOK`

**BookReadingStats Interface:**
```typescript
interface BookReadingStats {
  bookId: string
  totalMinutes: number
  sessionCount: number
  lastSession: string | null  // ISO date
}
```

---

### `getOverallStats(): Promise<ReadingStats>`

Retrieves overall reading statistics across all books.

**Returns:**
- `Promise<ReadingStats>` - Overall stats

**Example:**
```typescript
const stats = await window.api.getOverallStats()
console.log(`Total reading time: ${stats.totalMinutes} minutes`)
console.log(`Books read: ${stats.booksRead}`)
```

**IPC Channel:** `STATS_GET_OVERALL`

**ReadingStats Interface:**
```typescript
interface ReadingStats {
  totalMinutes: number
  booksRead: number  // Books with at least one session
  totalSessions: number
}
```

---

## Shelves API

### `getAllShelves(): Promise<ShelfWithBookCount[]>`

Retrieves all user-created shelves with book counts.

**Returns:**
- `Promise<ShelfWithBookCount[]>` - Array of shelves with bookCount property

**Example:**
```typescript
const shelves = await window.api.getAllShelves()
shelves.forEach(shelf => {
  console.log(`${shelf.name}: ${shelf.bookCount} books`)
})
```

**IPC Channel:** `SHELVES_GET_ALL`

---

### `createShelf(name: string, color?: string, icon?: string): Promise<Shelf>`

Creates a new shelf.

**Parameters:**
- `name` (string) - Shelf name
- `color` (string, optional) - Hex color (default: '#3b82f6')
- `icon` (string, optional) - Emoji icon (default: '📚')

**Returns:**
- `Promise<Shelf>` - Created shelf object

**Example:**
```typescript
const shelf = await window.api.createShelf('Science Fiction', '#8b5cf6', '🚀')
console.log(shelf.id)
```

**IPC Channel:** `SHELVES_CREATE`

---

### `updateShelf(shelfId: string, updates: Partial<Shelf>): Promise<void>`

Updates shelf properties.

**Parameters:**
- `shelfId` (string) - Shelf UUID
- `updates` (Partial<Shelf>) - Fields to update (name, color, icon)

**Example:**
```typescript
await window.api.updateShelf(shelfId, {
  name: 'Sci-Fi Classics',
  color: '#10b981'
})
```

**IPC Channel:** `SHELVES_UPDATE`

---

### `deleteShelf(shelfId: string): Promise<void>`

Permanently deletes a shelf (books are not deleted).

**Parameters:**
- `shelfId` (string) - Shelf UUID

**Example:**
```typescript
await window.api.deleteShelf(shelfId)
```

**IPC Channel:** `SHELVES_DELETE`

**Side Effects:**
- Removes all book-shelf associations
- Does not delete books themselves

---

### `getShelfBooks(shelfId: string): Promise<Book[]>`

Retrieves all books in a shelf.

**Parameters:**
- `shelfId` (string) - Shelf UUID

**Returns:**
- `Promise<Book[]>` - Array of books in the shelf

**Example:**
```typescript
const books = await window.api.getShelfBooks(shelfId)
console.log(`${books.length} books in shelf`)
```

**IPC Channel:** `SHELVES_GET_BOOKS`

---

### `addBookToShelf(shelfId: string, bookId: string): Promise<void>`

Adds a book to a shelf.

**Parameters:**
- `shelfId` (string) - Shelf UUID
- `bookId` (string) - Book UUID

**Example:**
```typescript
await window.api.addBookToShelf(shelfId, bookId)
```

**IPC Channel:** `SHELVES_ADD_BOOK`

**Note:** Silently ignores if book is already in shelf (uses INSERT OR IGNORE).

---

### `removeBookFromShelf(shelfId: string, bookId: string): Promise<void>`

Removes a book from a shelf.

**Parameters:**
- `shelfId` (string) - Shelf UUID
- `bookId` (string) - Book UUID

**Example:**
```typescript
await window.api.removeBookFromShelf(shelfId, bookId)
```

**IPC Channel:** `SHELVES_REMOVE_BOOK`

---

### `getBookShelves(bookId: string): Promise<Shelf[]>`

Retrieves all shelves containing a book.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<Shelf[]>` - Array of shelves

**Example:**
```typescript
const shelves = await window.api.getBookShelves(bookId)
console.log(`Book is in ${shelves.length} shelves`)
```

**IPC Channel:** `SHELVES_GET_FOR_BOOK`

---

### `getSmartShelves(): Promise<ShelfWithBookCount[]>`

Retrieves auto-generated smart shelves with book counts.

**Returns:**
- `Promise<ShelfWithBookCount[]>` - Array of smart shelves

**Example:**
```typescript
const smartShelves = await window.api.getSmartShelves()
// Returns: Recently Added, In Progress, Unread, Finished, Large Files
```

**IPC Channel:** `SHELVES_GET_SMART`

**Smart Shelf Types:**
- `smart-recent`: Recently Added (latest 20 books)
- `smart-progress`: In Progress (0% < progress < 100%)
- `smart-unread`: Unread (progress === 0%)
- `smart-finished`: Finished (progress >= 100%)
- `smart-large`: Large Files (pages > 300)

---

### `getSmartShelfBooks(smartShelfId: string): Promise<Book[]>`

Retrieves books from a smart shelf.

**Parameters:**
- `smartShelfId` (string) - Smart shelf ID (e.g., 'smart-recent')

**Returns:**
- `Promise<Book[]>` - Array of books matching smart shelf criteria

**Example:**
```typescript
const inProgressBooks = await window.api.getSmartShelfBooks('smart-progress')
```

**IPC Channel:** `SHELVES_GET_SMART_BOOKS`

---

## Files API

### `getBookFile(bookId: string): Promise<string>`

Retrieves book file content as base64 string.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<string>` - Base64-encoded file content

**Example:**
```typescript
const base64 = await window.api.getBookFile(bookId)
const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
```

**IPC Channel:** `FILES_GET_BOOK`

**Note:** For large files, decode in chunks to avoid memory issues.

---

### `getCoverImage(bookId: string): Promise<string | null>`

Retrieves book cover image path.

**Parameters:**
- `bookId` (string) - Book UUID

**Returns:**
- `Promise<string | null>` - Cover image file path or null

**Example:**
```typescript
const coverPath = await window.api.getCoverImage(bookId)
if (coverPath) {
  // Use in <img src={`file://${coverPath}`} />
}
```

**IPC Channel:** `FILES_GET_COVER`

---

## Settings API

### `getSettings(): Promise<Record<string, any>>`

Retrieves all app settings.

**Returns:**
- `Promise<Record<string, any>>` - Settings object

**Example:**
```typescript
const settings = await window.api.getSettings()
console.log(settings.theme, settings.fontSize)
```

**IPC Channel:** `SETTINGS_GET`

---

### `saveSetting(key: string, value: any): Promise<void>`

Saves a single setting.

**Parameters:**
- `key` (string) - Setting key
- `value` (any) - Setting value (JSON serializable)

**Example:**
```typescript
await window.api.saveSetting('theme', 'dark')
await window.api.saveSetting('fontSize', 16)
```

**IPC Channel:** `SETTINGS_SAVE`

---

## Data Models

### Book

```typescript
interface Book {
  id: string              // UUID
  title: string           // Book title
  author: string          // Author name
  type: 'pdf' | 'epub' | 'txt'
  pages: number | null    // Page count (null for EPUB)
  coverPath: string | null
  filePath: string        // Absolute path in vault
  importedAt: string      // ISO date
  lastOpenedAt: string | null
}
```

### Progress

```typescript
interface Progress {
  bookId: string
  location: string        // Page number or EPUB CFI
  percentage: number      // 0-100
  timestamp: string       // ISO date
}
```

### Note

```typescript
interface Note {
  id: string              // UUID
  bookId: string
  content: string
  location: string | null
  createdAt: string       // ISO date
  updatedAt: string       // ISO date
}
```

### Highlight

```typescript
interface Highlight {
  id: string              // UUID
  bookId: string
  text: string            // Selected text
  location: string        // Page or CFI
  color: string           // Hex color
  createdAt: string       // ISO date
}
```

### ReadingSession

```typescript
interface ReadingSession {
  id: string              // UUID
  bookId: string
  startTime: string       // ISO date
  endTime: string | null
  durationMinutes: number
}
```

---

## Error Handling

All API methods throw errors on failure. Always use try-catch:

```typescript
try {
  const book = await window.api.importBook(filePath)
} catch (error) {
  console.error('Import failed:', error.message)
}
```

### Common Errors

- **File not found**: Invalid file path
- **Unsupported format**: File type not PDF/EPUB/TXT
- **Database error**: SQLite constraint violation
- **Permission denied**: File system access denied

---

## Best Practices

### 1. Debounce Frequent Calls

```typescript
// Don't save progress on every scroll event
const debouncedSave = debounce((progress) => {
  window.api.saveProgress(bookId, progress.location, progress.percentage)
}, 1000)
```

### 2. Batch Reads

```typescript
// Load all data in parallel
const [books, settings, stats] = await Promise.all([
  window.api.getBooks(),
  window.api.getSettings(),
  window.api.getOverallStats()
])
```

### 3. Handle Null Returns

```typescript
const progress = await window.api.getProgress(bookId)
const location = progress?.location ?? '1'  // Default to page 1
```

### 4. Cleanup Sessions

```typescript
// Use useEffect cleanup
useEffect(() => {
  const sessionId = await window.api.startReadingSession(bookId)
  
  return () => {
    window.api.endReadingSession(sessionId)
  }
}, [bookId])
```

---

## Type Safety

Import types in renderer for autocompletion:

```typescript
import type { Book, Highlight } from '@shared/types'

const books: Book[] = await window.api.getBooks()
```

Add global type declaration:

```typescript
// src/global.d.ts
declare global {
  interface Window {
    api: typeof import('../electron/preload').api
  }
}
```
