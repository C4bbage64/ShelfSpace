# ShelfSpace Architecture

## Overview

ShelfSpace is an offline-first desktop reading application built with Electron, React, and TypeScript. The architecture follows a clean separation between the main process (backend) and renderer process (frontend), communicating via Electron's IPC mechanism.

## Tech Stack

### Main Process (Backend)
- **Electron** - Desktop application container
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **better-sqlite3** - Local SQLite database
- **AdmZip** - EPUB file parsing

### Renderer Process (Frontend)
- **React 18** - UI framework
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **PDF.js** - PDF rendering and text layer
- **EPUB.js** - EPUB rendering

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────┐         ┌──────────────────────┐    │
│  │  Main Process  │   IPC   │  Renderer Process    │    │
│  │   (Backend)    │ ◄─────► │    (Frontend)        │    │
│  └────────────────┘         └──────────────────────┘    │
│         │                              │                │
│         │                              │                │
│    ┌────▼────┐                   ┌────▼────┐            │
│    │ SQLite  │                   │  React  │            │
│    │   DB    │                   │   App   │            │
│    └─────────┘                   └─────────┘            │
│         │                              │                │
│    ┌────▼────┐                   ┌────▼────┐            │
│    │  Book   │                   │ PDF.js  │            │
│    │  Vault  │                   │EPUB.js  │            │
│    └─────────┘                   └─────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Main Process (`/electron`)

#### `main.ts`
- App entry point
- Window creation and management
- IPC handler registration
- Database and vault initialization

#### IPC Handlers (`/electron/ipc`)
- `books.ts` - Book import, list, update, delete
- `progress.ts` - Reading progress tracking
- `notes.ts` - Notes and highlights CRUD
- `stats.ts` - Reading session statistics
- `files.ts` - File system operations
- `settings.ts` - App settings management

#### Services (`/electron/services`)
- `bookImporter.ts` - Book import logic and metadata extraction
- `coverExtractor.ts` - PDF/EPUB cover extraction
- `vault.ts` - File storage management in user data directory

#### Database (`/electron/db`)
- `index.ts` - SQLite connection management
- `schema.ts` - Table definitions
- `migrations.ts` - Database migrations

### 2. Preload Script (`/electron/preload.ts`)

Secure bridge between main and renderer processes. Exposes controlled APIs to the frontend:

```typescript
window.api.importBook()
window.api.getBooks()
window.api.saveProgress()
// ... etc
```

### 3. Renderer Process (`/src`)

#### Pages
- `Library.tsx` - Main library view with search/filter/sort
- `Reader.tsx` - Book reader container
- `Settings.tsx` - App settings UI

#### Readers (`/src/readers`)
- `PDFReader.tsx` - PDF.js implementation with text layer
- `EPUBReader.tsx` - EPUB.js implementation
- `TXTReader.tsx` - Plain text reader

#### Components
- `BookCard.tsx` - Book display card
- `BookGrid.tsx` - Grid/list layout
- `EditBookModal.tsx` - Book metadata editor
- `HighlightPanel.tsx` - Highlights sidebar
- `SearchBar.tsx` - Search input
- `Sidebar.tsx` - Navigation

#### State Management (`/src/stores`)
- `booksStore.ts` - Book library state (Zustand)
- `settingsStore.ts` - App settings state

## Data Flow

### Book Import Flow

```
1. User selects file
2. Renderer calls window.api.importBook(path)
3. Main process receives IPC
4. bookImporter.ts:
   - Generates UUID
   - Extracts metadata (title, author, pages)
   - Extracts cover image (EPUB)
   - Copies file to vault
   - Saves to SQLite
5. Returns Book object to renderer
6. Renderer updates local state
```

### Reading Progress Flow

```
1. User navigates in reader
2. Reader calls onProgressUpdate()
3. Renderer calls window.api.saveProgress()
4. Main process saves to SQLite
5. Next time book opens, progress is restored
```

### Highlights Flow

```
1. User selects text in PDF/EPUB
2. User clicks color in HighlightPanel
3. Renderer calls window.api.saveHighlight()
4. Main process saves to SQLite
5. Highlights appear in panel
```

## File Storage

### User Data Directory
```
{userData}/shelfspace/
├── library.db                          # SQLite database
└── books/
    └── {uuid}/
        ├── book.{pdf|epub|txt}        # Book file
        ├── cover.png                   # Cover image
        └── meta.json                   # Metadata cache
```

### Platform Paths
- **Windows**: `%APPDATA%\shelfspace`
- **macOS**: `~/Library/Application Support/shelfspace`
- **Linux**: `~/.config/shelfspace`

## Database Schema

### Tables

#### `books`
```sql
id TEXT PRIMARY KEY
title TEXT NOT NULL
author TEXT DEFAULT 'Unknown'
type TEXT NOT NULL  -- 'pdf' | 'epub' | 'txt'
pages INTEGER
coverPath TEXT
filePath TEXT NOT NULL
importedAt TEXT NOT NULL
lastOpenedAt TEXT
```

#### `progress`
```sql
bookId TEXT PRIMARY KEY
location TEXT NOT NULL  -- page number or EPUB CFI
percentage REAL DEFAULT 0
timestamp TEXT NOT NULL
FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
```

#### `notes`
```sql
id TEXT PRIMARY KEY
bookId TEXT NOT NULL
content TEXT NOT NULL
location TEXT
createdAt TEXT NOT NULL
updatedAt TEXT NOT NULL
FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
```

#### `highlights`
```sql
id TEXT PRIMARY KEY
bookId TEXT NOT NULL
text TEXT NOT NULL
location TEXT NOT NULL
color TEXT DEFAULT '#ffff00'
createdAt TEXT NOT NULL
FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
```

#### `reading_sessions`
```sql
id TEXT PRIMARY KEY
bookId TEXT NOT NULL
startTime TEXT NOT NULL
endTime TEXT
durationMinutes INTEGER DEFAULT 0
FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
```

#### `settings`
```sql
key TEXT PRIMARY KEY
value TEXT NOT NULL  -- JSON serialized
```

## Security Model

### Context Isolation
- Renderer process runs in isolated context
- No direct Node.js access from frontend
- All backend communication via preload bridge

### IPC Security
- Only whitelisted APIs exposed via preload
- Type-safe IPC channels
- Input validation on main process

### File System
- All file operations in main process
- Books stored in sandboxed vault
- No arbitrary file system access from renderer

## Performance Considerations

### SQLite Optimizations
- WAL mode enabled for concurrent reads
- Foreign keys enforced
- Indexes on frequently queried columns

### PDF.js
- Text layer for selection without performance hit
- Canvas rendering with viewport optimization
- Page-by-page loading (no full document in memory)

### EPUB.js
- Lazy loading of chapters
- Reflowable text rendering
- CSS injection for theming

### State Management
- Zustand for minimal re-renders
- Computed selectors for filtered/sorted data
- Local state for UI-only concerns

## Build & Packaging

### Development
```bash
pnpm dev
# Runs: tsc + vite dev server + electron
```

### Production Build
```bash
pnpm build
# Compiles TypeScript + bundles React
pnpm package
# Creates distributable for current platform
```

### Electron Builder
- Windows: NSIS installer + portable
- macOS: DMG + App
- Linux: AppImage + deb

## Extension Points

### Future Enhancements
1. **Plugin System** - Load user plugins via main process
2. **Cloud Sync** - Optional backend for multi-device sync
3. **Full-Text Search** - PDF/EPUB content indexing
4. **Collections** - Book organization beyond flat list
5. **Themes** - More reader themes and fonts
6. **Export** - Notes/highlights export to Markdown

## Testing Strategy

### Unit Tests (Future)
- Database operations
- Metadata extraction
- IPC handlers

### Integration Tests (Future)
- E2E with Playwright
- Import/read workflows
- Progress persistence

### Manual Testing
- Cross-platform builds
- Large library performance
- File corruption handling
