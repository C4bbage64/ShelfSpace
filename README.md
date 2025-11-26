# ShelfSpace

An offline-first desktop reading application built with Electron, React, and TypeScript.

## Features

- 📚 Import and manage PDF, EPUB, and TXT books
- 📖 Built-in readers with customizable themes
- 💾 Automatic reading progress tracking
- 📝 Notes and highlights (coming soon)
- 🎨 Dark, Light, and Sepia themes
- 🔍 Search and filter your library
- 💻 Works completely offline

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

```
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

## License

MIT
