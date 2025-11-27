# Features

## Overview

ShelfSpace is an offline-first desktop reading application that supports PDF, EPUB, and TXT files. It provides a distraction-free reading experience with powerful organization and annotation tools.

## Core Features

### 📚 Multi-Format Support

#### PDF Reader
- High-quality canvas rendering via PDF.js
- Page-by-page navigation
- Text selection and copying
- Zoom controls
- Text layer for accurate selection

#### EPUB Reader
- Reflowable text rendering via EPUB.js
- Chapter navigation
- Font size adjustment
- Night mode support
- Responsive layout

#### TXT Reader
- Clean text display
- Automatic line wrapping
- Monospace and serif font options
- Scroll-based reading

### 📖 Library Management

#### Import Books
- Drag-and-drop file import
- File picker dialog
- Automatic metadata extraction
- Cover image extraction (EPUB/PDF)
- Duplicate detection

#### Organize Library
- **Grid View**: Card-based layout with covers
- **List View**: Compact table layout
- **Search**: Real-time filtering by title/author
- **Filter by Type**: PDF, EPUB, TXT tabs
- **Sort Options**:
  - Title (A-Z)
  - Author (A-Z)
  - Recently added
  - Last opened

#### Edit Metadata
- Edit book title
- Edit author name
- Changes persist across sessions
- Validation for empty fields

#### Delete Books
- One-click deletion with confirmation
- Removes book file and all data
- Cascades to highlights, notes, sessions

### 🎨 Reading Experience

#### Highlights
- Text selection in PDF and EPUB
- 5 color options:
  - Yellow (default)
  - Green
  - Blue
  - Pink
  - Orange
- Side panel for managing highlights
- View all highlights for current book
- Delete individual highlights
- Location references for quick navigation

#### Notes (Coming Soon)
- Create text notes at any location
- Attach notes to specific pages/chapters
- Full-text search within notes

#### Reading Progress
- Auto-save current location
- Resume from last position
- Progress percentage tracking
- Syncs across app restarts

#### Reading Sessions
- Automatic session tracking
- Duration calculation
- Per-book statistics:
  - Total reading time
  - Number of sessions
  - Last session date
- Overall statistics:
  - Total time across all books
  - Number of books read
  - Total sessions

### ⚙️ Settings

#### Appearance
- **Theme**: Light / Dark / System
- **Font Size**: Adjustable (12-24px)
- **Font Family**: Sans-serif / Serif / Monospace
- **Line Height**: Comfortable reading spacing

#### Behavior
- **Auto-save progress**: Frequency (1-10 minutes)
- **Default view**: Grid / List
- **Default sort**: Title / Author / Date

#### Storage
- View library location
- View database size
- Export data (Coming Soon)
- Backup/restore (Coming Soon)

### 🔒 Privacy & Security

#### Offline-First
- No internet connection required
- All data stored locally
- No tracking or analytics
- No cloud dependencies

#### Data Storage
- SQLite database for metadata
- Sandboxed file vault for books
- Platform-native security:
  - Windows: `%APPDATA%\shelfspace`
  - macOS: `~/Library/Application Support/shelfspace`
  - Linux: `~/.config/shelfspace`

#### Context Isolation
- Renderer process sandboxed
- No direct Node.js access from UI
- Secure IPC bridge via preload script

## Use Cases

### For Students
- Import textbooks and academic papers
- Highlight key concepts with color coding
- Track reading time for study sessions
- Take notes alongside readings
- Search across entire library

### For Researchers
- Organize research papers
- Extract and annotate passages
- Cross-reference multiple documents
- Export highlights for citations
- Maintain local control of sensitive data

### For Casual Readers
- Build personal ebook library
- Resume books from any device (same OS)
- Distraction-free reading mode
- Track reading habits
- No subscription fees

## Platform Support

### Windows
- Windows 10+ (64-bit)
- Installer: NSIS setup wizard
- Portable: Standalone executable

### macOS
- macOS 11+ (Big Sur and later)
- Universal binary (Intel + Apple Silicon)
- Installer: DMG disk image

### Linux
- Ubuntu 20.04+
- Debian 10+
- Fedora 32+
- Formats: AppImage, deb

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + O` - Import book
- `Ctrl/Cmd + F` - Search library
- `Ctrl/Cmd + ,` - Open settings

### Reader
- `←` / `→` - Previous/next page (PDF)
- `Space` - Next page
- `Shift + Space` - Previous page
- `Home` / `End` - First/last page
- `Ctrl/Cmd + +` / `-` - Zoom in/out (PDF)
- `Ctrl/Cmd + 0` - Reset zoom
- `Ctrl/Cmd + H` - Toggle highlights panel
- `Ctrl/Cmd + N` - New note
- `Esc` - Close reader

### Highlights
- Select text → Click color → Highlight created
- Click highlight in panel → Jump to location
- Hover highlight → Show delete button

## Performance

### Large Libraries
- Tested with 1,000+ books
- Instant search/filter (< 100ms)
- Pagination for list view (coming soon)
- Lazy loading for covers

### Large Files
- PDFs up to 1,000 pages
- EPUBs up to 500 chapters
- Page-by-page rendering (no full load)
- Memory-efficient canvas reuse

### Startup Time
- Cold start: < 2 seconds
- Warm start: < 1 second
- Database initialization: < 100ms

## Accessibility

### Screen Readers (Coming Soon)
- ARIA labels on all controls
- Keyboard navigation support
- Focus management

### Visual
- High contrast mode
- Scalable UI fonts
- Adjustable reader fonts
- Color-blind friendly highlights

### Keyboard Navigation
- Tab through all controls
- Enter to activate buttons
- Arrow keys for lists
- Escape to close modals

## Data Management

### Backup
Manually backup these locations:
- **Database**: `{appData}/shelfspace/library.db`
- **Books**: `{appData}/shelfspace/books/`

### Export (Coming Soon)
- Highlights to Markdown
- Notes to TXT/CSV
- Library list to JSON
- Statistics to CSV

### Import (Coming Soon)
- Calibre library support
- Goodreads integration
- CSV import for metadata

## Limitations

### Current Version
- No cloud sync (local-only)
- No mobile app
- No collaborative features
- No audiobook support
- No DRM-protected content
- Single-user per database

### File Formats
- **PDF**: No form filling, no annotations editing
- **EPUB**: Fixed-layout EPUBs limited support
- **TXT**: No Markdown rendering

## Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for planned features.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shelfspace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/shelfspace/discussions)
- **Email**: support@shelfspace.app (if configured)

## License

MIT License - See [LICENSE](../LICENSE) file for details.
