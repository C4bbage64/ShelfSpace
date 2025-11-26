# ShelfSpace

An offline-first desktop reading application built with Electron, React, and TypeScript.

## Features

- 📚 **Import and manage** PDF, EPUB, and TXT books
- 📖 **Built-in readers** with customizable themes
- 💾 **Automatic progress tracking** - picks up where you left off
- 📝 **Notes and highlights** with color options
- ⏱️ **Reading statistics** - track time spent reading
- ✏️ **Edit book metadata** - update title and author
- 🎨 **Dark, Light, and Sepia themes**
- 🔍 **Search and filter** your library
- 📊 **Multiple view modes** - grid and list views
- 🖱️ **Drag and drop import** - easily add books
- 🖼️ **Automatic cover extraction** for EPUB files
- 💻 **Works completely offline**

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **SQLite** (better-sqlite3) - Local database
- **PDF.js** - PDF rendering
- **EPUB.js** - EPUB rendering
- **Zustand** - State management
- **React Router** - Navigation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shelfspace.git
cd shelfspace

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

This will start both the Vite dev server and Electron in development mode.

### Building

```bash
# Build the app
pnpm build

# Package for your platform
pnpm package

# Or package for specific platforms
pnpm package:win    # Windows
pnpm package:mac    # macOS
pnpm package:linux  # Linux
```

## Project Structure

```text
shelfspace/
├── electron/           # Electron main process
│   ├── main.ts         # App entry point
│   ├── preload.ts      # Secure bridge to renderer
│   ├── ipc/            # IPC handlers
│   ├── db/             # SQLite database layer
│   └── services/       # Business logic
│
├── src/                # React renderer
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   ├── readers/        # PDF/EPUB/TXT readers
│   ├── stores/         # Zustand state stores
│   └── styles/         # Global styles
│
├── shared/             # Shared TypeScript types
│   └── types/          # Type definitions
│
└── resources/          # App icons and assets
```

## Data Storage

All data is stored locally:

- **Database**: `{userData}/shelfspace/library.db`
- **Books**: `{userData}/shelfspace/books/{uuid}/`

Where `{userData}` is:

- Windows: `%APPDATA%`
- macOS: `~/Library/Application Support`
- Linux: `~/.config`

## Keyboard Shortcuts

### Reader

| Shortcut | Action |
|----------|--------|
| `←` / `PageUp` | Previous page |
| `→` / `PageDown` | Next page |
| `Ctrl/Cmd + +` | Zoom in (PDF) |
| `Ctrl/Cmd + -` | Zoom out (PDF) |

### Library

| Shortcut | Action |
|----------|--------|
| `Drag & Drop` | Import files |

## Recent Changes

### v0.1.0

- ✅ Book import (PDF, EPUB, TXT)
- ✅ PDF reader with page navigation and zoom
- ✅ EPUB reader with chapter navigation
- ✅ TXT reader with scroll progress
- ✅ SQLite database for library management
- ✅ Reading progress persistence
- ✅ Highlights with color picker
- ✅ Edit book metadata (title, author)
- ✅ EPUB cover extraction
- ✅ Reading session tracking
- ✅ Search and filter library
- ✅ Grid and list view modes
- ✅ Drag and drop import
- ✅ Delete books

## License

MIT
