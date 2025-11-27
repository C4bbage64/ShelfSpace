# Development Guide

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ ([Install pnpm](https://pnpm.io/installation))
- **Git**

### Platform-Specific Requirements

#### Windows
- Visual Studio Build Tools 2019+
- Python 3.x (for native module compilation)

#### macOS
- Xcode Command Line Tools: `xcode-select --install`

#### Linux
- GCC/G++ compiler
- `libsqlite3-dev` (for better-sqlite3)
- `libglib2.0-dev`, `libgtk-3-dev` (for Electron)

## Initial Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd shelfspace
pnpm install
```

### 2. Database Initialization

Database is auto-created on first run at:
- Windows: `%APPDATA%\shelfspace\library.db`
- macOS: `~/Library/Application Support/shelfspace/library.db`
- Linux: `~/.config/shelfspace/library.db`

### 3. Rebuild Native Modules

If you encounter better-sqlite3 errors:

```bash
pnpm rebuild
```

## Development Workflow

### Start Dev Server

```bash
pnpm dev
```

This runs:
1. TypeScript compiler (watch mode)
2. Vite dev server (port 5173)
3. Electron with hot reload

### Project Structure

```
shelfspace/
├── electron/              # Main process code
│   ├── main.ts           # Entry point
│   ├── preload.ts        # IPC bridge
│   ├── db/               # Database
│   ├── ipc/              # IPC handlers
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── src/                  # Renderer process
│   ├── App.tsx           # Root component
│   ├── components/       # Reusable UI
│   ├── pages/            # Route pages
│   ├── readers/          # File format readers
│   ├── stores/           # Zustand stores
│   └── styles/           # Global CSS
├── shared/               # Shared types
│   └── types/            # TypeScript interfaces
├── dist/                 # Build output (gitignored)
├── out/                  # Packaged apps (gitignored)
└── docs/                 # Documentation
```

### TypeScript Configuration

#### Main Process (`tsconfig.node.json`)
- Target: ES2022
- Module: CommonJS (Electron requirement)
- Includes: `electron/**/*.ts`, `shared/**/*.ts`

#### Renderer Process (`tsconfig.json`)
- Target: ES2022
- Module: ESNext
- Includes: `src/**/*.ts`, `src/**/*.tsx`

### Path Aliases

```typescript
import { Book } from '@shared/types/book'  // Works in both processes
```

Configured in:
- `tsconfig.json` - TypeScript resolution
- `vite.config.ts` - Vite bundler

## Build Commands

### Development Build
```bash
pnpm build
```
Compiles TypeScript + bundles React (no packaging)

### Production Package
```bash
pnpm package
```
Creates distributable for your platform:
- Windows: `out/ShelfSpace Setup.exe`
- macOS: `out/ShelfSpace.dmg`
- Linux: `out/ShelfSpace.AppImage`

### Clean Build
```bash
# Remove all build artifacts
rm -rf dist out

# Reinstall dependencies
pnpm clean
pnpm install
```

## Debugging

### Main Process

#### VS Code Launch Config (`.vscode/launch.json`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": [".", "--remote-debugging-port=9223"],
      "outputCapture": "std"
    }
  ]
}
```

#### Chrome DevTools
```bash
# Start with debug port
electron . --inspect=5858
```
Open `chrome://inspect` in Chrome

### Renderer Process

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open DevTools.

Enable in production:
```typescript
// electron/main.ts
mainWindow.webContents.openDevTools()
```

### Database Inspection

Use SQLite CLI or GUI tool:

```bash
# Install sqlite3 CLI
npm install -g sqlite3

# Open database
sqlite3 "%APPDATA%\shelfspace\library.db"
```

Or use [DB Browser for SQLite](https://sqlitebrowser.org/)

### IPC Debugging

Add logging to preload:
```typescript
// electron/preload.ts
ipcRenderer.on('*', (event, ...args) => {
  console.log('IPC Event:', event.channel, args)
})
```

## Common Issues

### Issue: "better-sqlite3 not found" Error

**Cause**: Native module not compiled for Electron

**Fix**:
```bash
pnpm rebuild
# or
./node_modules/.bin/electron-rebuild
```

### Issue: Vite Fails to Start (Port in Use)

**Cause**: Port 5173 already occupied

**Fix**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

Or change port in `vite.config.ts`:
```typescript
server: {
  port: 5174
}
```

### Issue: Blank Screen on Electron Start

**Cause**: Renderer not built or Vite server not running

**Fix**:
1. Check Vite is running: `http://localhost:5173`
2. Check `electron/main.ts` points to correct URL
3. Clear cache: `rm -rf node_modules/.vite`

### Issue: PDF Text Selection Not Working

**Cause**: PDF.js text layer not rendering

**Fix**:
1. Ensure `pdf_viewer.css` is imported in `PDFReader.tsx`
2. Check `.textLayer` CSS has `position: absolute` and `z-index: 2`
3. Verify TextLayer is rendered in DOM inspector

### Issue: EPUB Cover Not Extracting

**Cause**: OPF file path mismatch in EPUB

**Fix**:
Check `coverExtractor.ts` logs for OPF parsing errors. Some EPUBs use non-standard OPF locations.

### Issue: Books Not Persisting After App Restart

**Cause**: Database not initialized or corrupted

**Fix**:
1. Check database file exists
2. Run migrations: `DELETE FROM books; -- test table access`
3. Reset database: Delete `library.db` and restart

## Code Style

### Linting (ESLint)
```bash
pnpm lint
```

### Formatting (Prettier)
```bash
pnpm format
```

### Conventions
- Use TypeScript strict mode
- Prefer functional components
- Use async/await over promises
- IPC channel names: uppercase snake_case (`BOOKS_GET_ALL`)
- Component names: PascalCase
- File names: camelCase for code, kebab-case for assets

## Database Migrations

### Adding a Migration

Edit `electron/db/migrations.ts`:

```typescript
export const migrations = [
  // ... existing migrations
  {
    version: 3,
    up: (db: Database) => {
      db.exec(`
        CREATE TABLE collections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `)
    }
  }
]
```

On next app start, migration runs automatically.

### Testing Migrations

```typescript
// electron/db/index.ts
console.log('Current schema version:', db.pragma('user_version', { simple: true }))
```

## Adding New Features

### 1. Define Types
```typescript
// shared/types/feature.ts
export interface MyFeature {
  id: string
  name: string
}
```

### 2. Add IPC Channel
```typescript
// shared/types/ipc.ts
export enum IpcChannel {
  MY_FEATURE_GET = 'MY_FEATURE_GET'
}
```

### 3. Create IPC Handler
```typescript
// electron/ipc/myFeature.ts
import { ipcMain } from 'electron'
import { IpcChannel } from '@shared/types/ipc'

export function registerMyFeatureHandlers() {
  ipcMain.handle(IpcChannel.MY_FEATURE_GET, async () => {
    // Implementation
    return { success: true }
  })
}
```

### 4. Register in Main
```typescript
// electron/main.ts
import { registerMyFeatureHandlers } from './ipc/myFeature'

registerMyFeatureHandlers()
```

### 5. Expose in Preload
```typescript
// electron/preload.ts
export const api = {
  getMyFeature: () => ipcRenderer.invoke(IpcChannel.MY_FEATURE_GET)
}
```

### 6. Use in Renderer
```typescript
// src/components/MyComponent.tsx
const data = await window.api.getMyFeature()
```

## Performance Tips

### Reduce Bundle Size
- Use dynamic imports for readers:
  ```typescript
  const PDFReader = lazy(() => import('@/readers/PDFReader'))
  ```

### Optimize SQLite
- Use prepared statements for bulk inserts
- Enable WAL mode (already configured)
- Add indexes for frequently queried columns

### Optimize React
- Use `React.memo()` for expensive components
- Use Zustand selectors to prevent unnecessary re-renders
- Virtualize large lists with `react-window`

## Testing (Future)

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run `pnpm build` and test
- [ ] Run `pnpm package` for all platforms
- [ ] Test installers on clean systems
- [ ] Create GitHub release with binaries
- [ ] Tag commit: `git tag v1.0.0`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [EPUB.js Documentation](https://github.com/futurepress/epub.js)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
