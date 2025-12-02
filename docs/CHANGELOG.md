# Changelog

All notable changes to ShelfSpace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Reader Settings Panel**: Font size, font family, line height, theme (light/dark/sepia), text alignment, and margins
- **Floating Selection Toolbar**: Quick highlight creation with color picker when selecting text
- **Bookmarks (EPUB)**: Add/remove bookmarks with dropdown list to view and navigate
- **Search in Book (EPUB)**: In-book search with Ctrl+F, result navigation, and highlighted matches
- **Keyboard Shortcuts**: Full keyboard navigation with `?` help modal
  - Navigation: Arrow keys, Page Up/Down, Space
  - Features: Ctrl+F (search), Ctrl+B (bookmark), Ctrl+H (highlights), Ctrl+T (TOC)
  - Zoom: Ctrl++/-, Ctrl+0 (reset)
  - Settings: Ctrl+,
- **EPUBReader ref API**: Exposed goNext, goPrev, goTo, search methods via forwardRef
- **Chapter tracking**: Current chapter name passed to Reader component
- **Multi-format reader**: PDF, EPUB, and TXT support
- **Library management**: Import books via drag-and-drop or file picker
- **Automatic metadata extraction**: Title, author, page count from PDF/EPUB
- **Cover image extraction**: Automatic cover extraction from EPUB files using OPF parser
- **Shelves system**: Organize books into custom shelves (like playlists)
- **Smart Shelves**: Auto-generated shelves (Recently Added, In Progress, Unread, Finished, Large Files)
- **Drag-and-drop organization**: Drag books onto shelves to add them
- **Many-to-many relationships**: Books can belong to multiple shelves
- **Search and filter**: Real-time search by title/author, filter by file type
- **Sort options**: Sort by title, author, import date, or last opened
- **Grid and list views**: Toggle between card-based grid and compact list
- **Reading progress tracking**: Auto-save and restore reading position with progress column
- **Highlights system**: Create colored highlights with 5 color options (Yellow, Green, Blue, Pink, Orange)
- **Highlights panel**: Side panel to view, navigate, and delete highlights
- **Text selection in PDF**: PDF.js TextLayer integration for accurate text selection
- **Edit book metadata**: Edit title and author for any book
- **Reading sessions tracking**: Automatic session duration tracking with statistics
- **Per-book statistics**: View total reading time, session count, and last session date
- **Overall statistics**: Track total reading time across all books
- **SQLite database**: Local storage with migrations support
- **Settings management**: Theme, font size, font family, reading preferences
- **Electron + React stack**: Modern desktop app with TypeScript
- **Offline-first design**: No internet required, all data stored locally
- **Cross-platform support**: Windows, macOS, and Linux builds
- **Dark mode**: System-aware theme switching

### Technical Implementation
- **Electron 39.2.4**: Main process with secure IPC handlers
- **React 19.2.0**: Modern renderer with hooks and functional components
- **Vite 7.2.4**: Fast build tool with hot module replacement
- **TypeScript 5.9.3**: Strict mode for type safety
- **better-sqlite3**: Native SQLite bindings with electron-rebuild
- **pdfjs-dist 5.4.394**: Canvas-based PDF rendering with text layer
- **epubjs 0.3.93**: Reflowable EPUB rendering
- **adm-zip 0.5.16**: EPUB metadata and cover extraction
- **zustand 5.0.8**: Lightweight state management
- **react-router-dom 7.9.6**: Client-side routing
- **Database migrations**: Automated schema versioning
- **Preload script**: Secure IPC bridge with context isolation
- **Book vault**: Sandboxed file storage in app data directory

### Database Schema
- `books` table: Book metadata with foreign key constraints and progress column
- `shelves` table: User-created shelves with customizable name, color, and icon
- `book_shelf` table: Many-to-many junction table for shelf membership
- `progress` table: Reading position tracking
- `notes` table: User notes with location references
- `highlights` table: Text highlights with color and location
- `reading_sessions` table: Session tracking with duration calculation
- `settings` table: App configuration storage
- Foreign key cascades for data integrity
- WAL mode for concurrent access

### Documentation
- **PRD.md**: Product requirements document
- **README.md**: Setup instructions and feature overview
- **ARCHITECTURE.md**: System design and technical details
- **DEVELOPMENT.md**: Developer setup and debugging guide
- **API.md**: Complete IPC API reference
- **FEATURES.md**: User-facing feature documentation
- **CHANGELOG.md**: Version history (this file)

### Fixed
- PDF text selection not working (added TextLayer)
- EPUB cover extraction failures (OPF parser improvements)
- Reading progress not saving (debounced auto-save)
- Database migrations not running (fixed version checking)
- Build errors with better-sqlite3 (added electron-rebuild)
- NODE_ENV undefined in main process (added Vite define)
- Dev server port conflicts (graceful fallback)

## [0.1.0] - 2024-01-XX (Future Release)

### Planning
This will be the first official release once all MVP features are polished and tested on all platforms.

**Pre-release checklist:**
- [ ] Complete cross-platform testing
- [ ] Add unit tests for core functionality
- [ ] Add E2E tests with Playwright
- [ ] Performance benchmarks for large libraries
- [ ] Security audit of IPC handlers
- [ ] Code signing for macOS/Windows
- [ ] Auto-updater implementation
- [ ] User documentation website
- [ ] GitHub releases with binaries

## Future Enhancements

### Planned Features
- **Collections**: Organize books into custom collections
- **Tags**: Tag books with custom labels
- **Full-text search**: Search within book content (OCR for PDFs)
- **Export**: Export highlights and notes to Markdown/CSV
- **Backup/Restore**: One-click backup and restore functionality
- **Calibre import**: Import existing Calibre libraries
- **Book recommendations**: AI-powered reading suggestions
- **Reading goals**: Set and track reading goals
- **Book details page**: Extended metadata, description, ratings
- **Cover upload**: Manually upload custom covers
- **Pagination**: Virtual scrolling for large libraries
- **Accessibility**: Full ARIA support and screen reader compatibility

### Technical Improvements
- **Testing**: Unit tests, integration tests, E2E tests
- **CI/CD**: GitHub Actions for automated builds
- **Performance**: Web Workers for heavy operations
- **Localization**: Multi-language support
- **Plugins**: Plugin system for community extensions
- **Cloud sync**: Optional cloud backup (end-to-end encrypted)
- **Mobile**: Companion mobile app (React Native)

## Development Notes

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature overhauls
- **Minor (0.X.0)**: New features, non-breaking changes
- **Patch (0.0.X)**: Bug fixes, documentation updates

### Release Process
1. Update version in `package.json`
2. Update this CHANGELOG with release date
3. Commit: `git commit -am "Release vX.Y.Z"`
4. Tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
5. Build: `pnpm package` for all platforms
6. Create GitHub release with binaries
7. Push: `git push && git push --tags`

### Branch Strategy
- `main`: Stable releases only
- `develop`: Active development
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

## Contributing

We welcome contributions! See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions.

**Ways to contribute:**
- Report bugs via GitHub Issues
- Suggest features via GitHub Discussions
- Submit pull requests
- Improve documentation
- Help with translations (future)

## License

MIT License - See [LICENSE](../LICENSE) for details.

## Acknowledgments

### Open Source Libraries
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [EPUB.js](https://github.com/futurepress/epub.js) - EPUB rendering
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite bindings
- [Vite](https://vite.dev/) - Build tool

### Inspiration
- Calibre - Feature-rich ebook manager
- Adobe Digital Editions - Reading experience
- Notion - Clean UI design
- Obsidian - Local-first philosophy

---

**Note**: This changelog tracks all changes from the initial development phase. Once version 0.1.0 is released, subsequent versions will have dedicated sections with release dates.
