# ShelfSpace — Product Requirements Document

> Electron + React + Vite Offline Reading App

## 1. Overview

ShelfSpace is an offline-first desktop reading application built using:

- **Electron** (desktop container + backend logic using Node.js)
- **React + Vite** (frontend UI)
- **SQLite** (local database)
- **PDF.js / EPUB.js** (reading engines)

ShelfSpace allows users to import, store, and read digital books (PDF, EPUB, TXT) completely offline. It provides reading progress tracking, notes, highlights, metadata management, and a polished Obsidian-inspired interface.

The application is entirely local:  
**No online connectivity, servers, or cloud services required for MVP.**

---

## 2. Goals

### 2.1 Primary Goals (MVP)

- Import books into a local "Book Vault"
- Store and display metadata (title, author, cover)
- Read PDF and EPUB files inside the app
- Automatically save and restore reading progress
- Local notes and highlights per book
- Local search and filters
- Minimal, elegant desktop UI

### 2.2 Non-Goals (MVP)

- Cloud sync
- Accounts
- Mobile version
- Web version
- Multi-device sync
- Plugins/extensions

These may be added later.

---

## 3. High-Level Architecture

### 3.1 Electron (Main Process)

Acts as the **backend** of the app, handling:

- SQLite database access
- Filesystem operations (copying books, extracting covers)
- Inter-Process Communication (IPC) with Renderer
- User data directory management
- Window creation and lifecycle

Located under:

```text
/electron/
```

### 3.2 Preload Script (Secure Bridge)

Electron's preload script exposes safe APIs to the React frontend:

```javascript
window.api.importBook()
window.api.getBooks()
window.api.saveProgress()
```

No direct Node access from React.

### 3.3 React + Vite (Renderer Process)

Handles:

- UI rendering
- Navigation
- PDF and EPUB viewers
- Displaying library
- Notes UI
- Interaction with Electron APIs

Located under:

```text
/src/
```

### 3.4 SQLite Database

A single local file stored in:

```javascript
Electron.getPath("userData") + "/shelfspace/library.db"
```

Tables:

- books  
- progress  
- notes  
- settings  

### 3.5 Local Book Vault

All imported books stored in:

```text
{userData}/shelfspace/books/{uuid}/book.pdf
{userData}/shelfspace/books/{uuid}/cover.png
{userData}/shelfspace/books/{uuid}/meta.json
```

This ensures:

- Offline access
- Predictable file structure
- Easy backup/export

---

## 4. Core Features (MVP)

### 4.1 Book Importing

- Drag & drop or file picker
- Supported formats: `pdf`, `epub`, `txt`
- Steps:
  1. Generate UUID
  2. Copy book to local Vault
  3. Extract cover (PDF first page / EPUB embedded)
  4. Extract metadata (title, author)
  5. Store entry in SQLite

### 4.2 Library View

- Grid + list view
- Sort:
  - Recent
  - Title
  - Author
- Search bar
- Book cards with:
  - Cover
  - Title
  - Author
  - Last opened

### 4.3 PDF Reader

- Powered by PDF.js
- Features:
  - Scroll mode
  - Page view mode
  - Zoom
  - Themes (Light / Dark / Sepia)
  - Save progress on page change

### 4.4 EPUB Reader

- Powered by EPUB.js
- Features:
  - Reflowable text
  - Font size adjustment
  - Themes
  - Progress tracking
  - TOC navigation

### 4.5 Reading Progress

Stored in SQLite as:

```text
bookId
location (page number or EPUB CFI)
timestamp
```

### 4.6 Notes & Highlights

- Markdown notes per book
- Highlights stored with location reference
- Side panel for notes
- Editable and searchable

---

## 5. Future Features (Phase 2+)

- Cloud sync (optional AWS backend)
- Multi-device accounts
- Web version (Next.js)
- Mobile app
- Plugins/extensions
- Full-text search inside PDFs/EPUBs
- Analytics (reading time, streaks)
- Tags and collections
- AI summaries

---

## 6. API Specification (Electron IPC)

### Books

| Channel          | Action |
|------------------|--------|
| `books:import`   | Import a book file |
| `books:getAll`   | List all books |
| `books:get`      | Get book metadata |
| `books:delete`   | Remove book & files |

### Progress

| Channel               | Action |
|-----------------------|--------|
| `progress:save`       | Save reading progress |
| `progress:get`        | Get progress for book |

### Notes

| Channel          | Action |
|------------------|--------|
| `notes:save`     | Create/update note |
| `notes:getAll`   | Get notes for a book |

### Files

| Channel            | Action |
|--------------------|--------|
| `file:getPath`     | Return book file path |

---

## 7. Storage Model

### Book Metadata Example

```json
{
  "id": "uuid",
  "title": "Example Book",
  "author": "Jane Doe",
  "type": "pdf",
  "pages": 220,
  "importedAt": "2025-01-01T12:00:00Z"
}
```

### Database Tables

#### books

```sql
id, title, author, coverPath, filePath
```

#### progress

```sql
bookId, location, timestamp
```

#### notes

```sql
bookId, content, timestamp
```

#### settings

```sql
theme, viewMode
```

---

## 8. Technical Constraints

- Must run offline at all times
- Must support Windows + macOS + Linux
- Electron main process cannot expose unsafe Node APIs to React
- Renderer must communicate via preload + IPC only
- SQLite file must be portable and recoverable
- App size should stay under 200 MB packaged
- Vite must build static files for Electron packaging
- Use **pnpm** as the package manager

---

## 9. Success Criteria

### Functional

- User can import books without errors
- Progress automatically saves and restores
- Library UI loads quickly even with 1000+ books
- Notes persist after restart
- Reader performs smoothly

### Technical

- Electron app launches backend logic instantly
- IPC communication stable
- SQLite database never corrupts
- Book Vault stays consistent

---

## 10. Deliverables

- Electron backend with IPC handlers
- React + Vite frontend
- Working Book Vault system
- SQLite schema + migration
- Functional PDF and EPUB readers
- App build script (.exe, .dmg)
- Documentation and developer setup guide

---

## 11. Project Structure

```text
shelfspace/
├── electron/                    # Electron main process
│   ├── main.ts                  # App entry point, window creation
│   ├── preload.ts               # Secure bridge to renderer
│   ├── ipc/                     # IPC handlers
│   │   ├── books.ts             # Book import/delete/list handlers
│   │   ├── progress.ts          # Reading progress handlers
│   │   ├── notes.ts             # Notes CRUD handlers
│   │   └── files.ts             # File path handlers
│   ├── db/                      # Database layer
│   │   ├── index.ts             # SQLite connection
│   │   ├── schema.ts            # Table definitions
│   │   └── migrations/          # Database migrations
│   └── services/                # Business logic
│       ├── bookImporter.ts      # Import, extract cover/metadata
│       ├── coverExtractor.ts    # PDF/EPUB cover extraction
│       └── vault.ts             # Book vault file management
│
├── src/                         # React + Vite renderer
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component, routing
│   ├── components/              # Reusable UI components
│   │   ├── BookCard.tsx         # Library book card
│   │   ├── BookGrid.tsx         # Grid/list view
│   │   ├── SearchBar.tsx        # Search input
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── ThemeToggle.tsx      # Theme switcher
│   ├── pages/                   # Route pages
│   │   ├── Library.tsx          # Main library view
│   │   ├── Reader.tsx           # Book reader container
│   │   └── Settings.tsx         # App settings
│   ├── readers/                 # Reader components
│   │   ├── PDFReader.tsx        # PDF.js viewer
│   │   ├── EPUBReader.tsx       # EPUB.js viewer
│   │   └── TXTReader.tsx        # Plain text viewer
│   ├── hooks/                   # Custom React hooks
│   │   ├── useBooks.ts          # Book data fetching
│   │   ├── useProgress.ts       # Progress tracking
│   │   └── useNotes.ts          # Notes management
│   ├── stores/                  # State management
│   │   └── appStore.ts          # Global app state
│   ├── styles/                  # Styling
│   │   ├── globals.css          # Global styles
│   │   └── themes.css           # Theme variables
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # Shared type definitions
│   └── utils/                   # Utility functions
│       └── helpers.ts           # Common helpers
│
├── resources/                   # Static assets for Electron
│   └── icons/                   # App icons
│
├── package.json                 # Dependencies & scripts
├── pnpm-lock.yaml               # pnpm lockfile
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite configuration
├── electron-builder.json        # Electron packaging config
└── README.md                    # Project documentation
```

---

If you want, I can also write:

- ✔ `TECH_DESIGN.md`
- ✔ `ARCHITECTURE.md`
- ✔ Full folder structure with boilerplate
- ✔ IPC handler templates
- ✔ SQLite schema + migrations
- ✔ Roadmap for cloud sync (Phase 2)

Just tell me what you need!
